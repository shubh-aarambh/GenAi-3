import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, collectionName } = body;

        if (!query || !collectionName) {
            return NextResponse.json({ success: false, error: "Missing query or collectionName" }, { status: 400 });
        }

        // Embeddings used for search
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
        });

        // Connect to existing Qdrant collection
        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: process.env.QDRANT_URL || "http://localhost:6333",
            apiKey: process.env.QDRANT_API_KEY,
            collectionName: collectionName
        });

        // Retrieve chunks
        const retriever = vectorStore.asRetriever({
            k: 5 // retrieve top 5 relevant chunks
        });

        const searchedChunks = await retriever.invoke(query);

        const client = new OpenAI();

        const system_prompt = `You are a helpful AI Assistant that answers questions based ONLY on the provided document context.
If the answer is not contained within the context, you must clearly state that you do not know. 
Do NOT use your general knowledge. Be precise and cite the context if possible.

CONTEXT:
${searchedChunks.map(chunk => chunk.pageContent).join("\n\n---\n\n")}`;

        const response = await client.chat.completions.create({
            model : 'gpt-4o-mini', // 4o-mini is OpenAI's recommended small model
            messages : [
                {
                    role : 'system',
                    content : system_prompt
                },
                {
                    role : 'user',
                    content : query
                }
            ]
        });

        return NextResponse.json({ 
            success: true, 
            answer: response.choices[0].message.content,
            context: searchedChunks
        });

    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
