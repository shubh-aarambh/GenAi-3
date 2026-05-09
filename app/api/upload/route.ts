import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file: File | null = data.get("file") as unknown as File;
        
        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        // Generate a unique collection name for this document
        const collectionName = "doc_" + uuidv4().replace(/-/g, "_");

        // Load PDF using WebPDFLoader (works seamlessly with Blobs/Files in Next.js without node fs issues)
        const loader = new WebPDFLoader(file);
        const docs = await loader.load();

        // Chunking Strategy Implementation
        // We use RecursiveCharacterTextSplitter which splits text recursively
        // by different characters (e.g. paragraphs, then sentences, then words)
        // to keep semantically related pieces of text together.
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        
        const splitDocs = await textSplitter.splitDocuments(docs);

        // Initialize embeddings
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });

        // Initialize Qdrant and index the documents
        await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
            url: process.env.QDRANT_URL || "http://localhost:6333",
            apiKey: process.env.QDRANT_API_KEY,
            collectionName: collectionName
        });

        return NextResponse.json({ 
            success: true, 
            message: "Document indexed successfully",
            collectionName: collectionName 
        });

    } catch (error: any) {
        console.error("Error in upload API:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
