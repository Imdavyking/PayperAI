import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; // ✅ FIXED
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
dotenv.config();
// Movement Docs RAG System
class MovementDocsRAG {
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings: OpenAIEmbeddings;
  private isInitialized: boolean = false;
  private baseUrl: string = "https://docs.movementnetwork.xyz";

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
    });
  }

  // Discover all documentation pages from sitemap or crawling
  private async discoverPages(): Promise<string[]> {
    try {
      // Common documentation paths
      const knownPaths = [
        "/general",
        "/general/networks",
        "/general/networks/mainnet",
        "/general/networks/testnet",
        "/general/l1/what-is-movement-l1",
        "/general/l1/move-language",
        "/general/usingmovement/community-support",
        "/general/usingmovement/connect_to_movement",
        "/general/sidechain/node-level-architecture",
        "/devs/move2",
        "/devs/movementcli",
        "/devs/faq#what-tools-are-available-for-developers",
      ];

      // Try to fetch sitemap first
      try {
        const sitemapUrl = `${this.baseUrl}/sitemap.xml`;
        const response = await axios.get(sitemapUrl);
        const $ = cheerio.load(response.data, { xmlMode: true });
        const urls: string[] = [];
        $("loc").each((_, elem) => {
          urls.push($(elem).text());
        });
        if (urls.length > 0) {
          console.log(`Found ${urls.length} pages from sitemap`);
          return urls;
        }
      } catch (error) {
        console.log("Sitemap not found, using known paths");
      }

      // Fallback to known paths
      return knownPaths.map((path) => `${this.baseUrl}${path}`);
    } catch (error) {
      console.error("Error discovering pages:", error);
      return [];
    }
  }

  // Scrape and index all documentation
  async initialize() {
    if (this.isInitialized) return;

    console.log("🔄 Initializing Movement Docs RAG...");

    try {
      const urls = await this.discoverPages();
      console.log(`📚 Loading ${urls.length} documentation pages...`);

      const allDocs = [];

      for (const url of urls.slice(0, 20)) {
        // Limit to first 20 pages for speed
        try {
          console.log(`Loading: ${url}`);
          const loader = new CheerioWebBaseLoader(url, {
            selector: "main, article, .markdown, .content, [role='main']",
          });
          const docs = await loader.load();

          // Add metadata
          docs.forEach((doc) => {
            doc.metadata = {
              ...doc.metadata,
              source: url,
              title: url.split("/").pop() || "Unknown",
            };
          });

          allDocs.push(...docs);
        } catch (error) {
          console.error(`Error loading ${url}:`, error);
        }
      }

      console.log(`✅ Loaded ${allDocs.length} documents`);

      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: ["\n\n", "\n", ".", " ", ""],
      });

      const splitDocs = await textSplitter.splitDocuments(allDocs);
      console.log(`📝 Split into ${splitDocs.length} chunks`);

      // Create vector store
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        this.embeddings
      );

      this.isInitialized = true;
      console.log("✅ Movement Docs RAG initialized successfully!");
    } catch (error) {
      console.error("❌ Error initializing RAG:", error);
      throw error;
    }
  }

  // Semantic search through documentation
  async search(query: string, k: number = 3): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.vectorStore) {
      return "Documentation not available. Please try again later.";
    }

    try {
      const results = await this.vectorStore.similaritySearch(query, k);

      if (results.length === 0) {
        return "No relevant documentation found for this query.";
      }

      // Format results with sources
      const formattedResults = results
        .map((doc: any, idx: any) => {
          const source = doc.metadata.source || "Unknown source";
          const title = doc.metadata.title || "Unknown";
          return `
### Result ${idx + 1} - ${title}
${doc.pageContent}

**Source:** ${source}
---`;
        })
        .join("\n\n");

      return formattedResults;
    } catch (error) {
      console.error("Error searching docs:", error);
      return "Error searching documentation. Please try again.";
    }
  }

  // Quick answer for common questions (cached)
  getQuickAnswer(query: string): string | null {
    const normalizedQuery = query.toLowerCase();

    const quickAnswers: Record<string, string> = {
      "gas fees": `Movement uses the MoveVM with low gas costs. Average transaction costs are approximately 0.0001 MOVE. Gas is paid in MOVE tokens, the native currency of the Movement Network.`,

      "fungible asset": `Fungible Assets (FA) are the token standard on Movement. To transfer FA tokens, use the primary_fungible_store::transfer function. MOVE tokens use a different transfer method (aptos_account::transfer).`,

      "fungible assets": `Fungible Assets (FA) are the token standard on Movement. To transfer FA tokens, use the primary_fungible_store::transfer function. MOVE tokens use a different transfer method (aptos_account::transfer).`,

      movevm: `MoveVM is Movement's execution environment, based on the Move language originally developed by Meta/Diem. It's fast, secure, and uses resource-oriented programming. Movement is an Ethereum L2 that combines MoveVM with Ethereum's ecosystem.`,

      testnet: `Movement testnet (Bardock) RPC: https://aptos.testnet.bardock.movementlabs.xyz/v1. Faucet: https://faucet.testnet.bardock.movementlabs.xyz. Explorer: https://explorer.movementnetwork.xyz/?network=testnet`,

      "move language": `Move is a resource-oriented programming language. Key features: resources can't be copied or dropped (must be explicitly destroyed), strong type safety, and formal verification support. Use 'module' to define smart contracts.`,

      "deploy token": `To deploy a fungible asset token on Movement: 1) Use fungible_asset::create_primary_store_enabled_fungible_asset, 2) Specify name, symbol, decimals, 3) Mint initial supply with fungible_asset::mint. The token will have a deterministic address.`,
    };

    for (const [key, answer] of Object.entries(quickAnswers)) {
      if (normalizedQuery.includes(key)) {
        return `**Quick Answer:**\n\n${answer}\n\n*For more details, I can search the full documentation.*`;
      }
    }

    return null;
  }
}

export const movementDocs = new MovementDocsRAG();
