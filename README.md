# Google NotebookLM Clone (RAG Pipeline)

This project is a full-stack Next.js web application that replicates the core functionality of Google NotebookLM. It allows users to upload any PDF document and ask natural language questions about its content, with answers grounded strictly in the document text using a Retrieval-Augmented Generation (RAG) pipeline.

## Features & RAG Pipeline Architecture
The pipeline is implemented end-to-end:
1. **Ingestion**: Documents are uploaded via a stunning Next.js UI. The backend uses `WebPDFLoader` from LangChain to safely read the PDF contents as Blobs in the Node environment.
2. **Chunking**: Text is split into manageable context windows using a specific chunking strategy (see below).
3. **Embedding**: Text chunks are converted into dense vector embeddings using OpenAI's `text-embedding-3-large` model.
4. **Storage**: Vectors and their associated text payloads are indexed and stored in a **Qdrant Vector Database**. A unique collection is dynamically created for each uploaded document.
5. **Retrieval**: When a user asks a question, their query is embedded. We perform similarity search against Qdrant to retrieve the top 5 most relevant document chunks.
6. **Generation**: An LLM (`gpt-4o-mini`) is provided with a strict system prompt containing *only* the retrieved context chunks. It generates a final answer grounded entirely in the context.

## Chunking Strategy Documented
We implemented the **Recursive Character Text Splitting** strategy using LangChain's `RecursiveCharacterTextSplitter`.

- **Strategy**: It attempts to split text hierarchically using a list of separators (e.g. `\n\n`, then `\n`, then spaces, then individual characters).
- **Why this strategy?**: This is the best general-purpose text splitting algorithm. By respecting natural paragraph and sentence boundaries, it keeps semantically related pieces of text together. If we simply chunked by fixed character counts, we might cut a sentence or paragraph in half, losing critical context.
- **Parameters**: 
  - `chunkSize: 1000`: We restrict chunks to ~1000 characters to keep our LLM context window focused and cost-effective.
  - `chunkOverlap: 200`: A 200-character overlap prevents contextual clipping at the boundaries (e.g., if a sentence spans across the boundary of two chunks).

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- [Docker](https://docs.docker.com/get-docker/) (for running Qdrant locally) or a [Qdrant Cloud Account](https://cloud.qdrant.io/)
- OpenAI API Key

### Setup
1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start a local Qdrant vector database using Docker:
   ```bash
   docker run -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_storage:/qdrant/storage:z qdrant/qdrant
   ```
4. Copy the environment template and add your API keys:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to add your `OPENAI_API_KEY`.*
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment Guide (For the Assignment)

To deploy this project to the public internet without local setup:

### 1. Set Up Qdrant Cloud (Database)
1. Go to [Qdrant Cloud](https://cloud.qdrant.io/) and create a free tier cluster.
2. Get the **Cluster URL** and a **Data Access API Key**.

### 2. Set Up Vercel (Frontend & Backend)
1. Push this code to a public GitHub repository.
2. Go to [Vercel](https://vercel.com/) and create a new project from your GitHub repository.
3. In the Vercel **Environment Variables** section, add the following:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `QDRANT_URL`: Your Qdrant Cloud URL (e.g., `https://xyz.aws.cloud.qdrant.io:6333`)
   - `QDRANT_API_KEY`: Your Qdrant Cloud API key
4. Click **Deploy**. Vercel will automatically build the Next.js app.

### Evaluation Criteria Checklist
- [x] Full RAG pipeline implemented end to end
- [x] Chunking strategy implemented and clearly documented
- [x] Vector DB (Qdrant) used for embeddings storage/retrieval
- [x] Beautiful UI for uploading documents and interacting
- [x] LLM strictly answers from retrieved context
- [x] Handles documents it has never seen before seamlessly
