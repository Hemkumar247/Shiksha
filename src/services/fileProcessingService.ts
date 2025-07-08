import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProcessingOptions } from '../types/documents';

const API_KEY = 'AIzaSyARfMwr6GwOOi6YkGFLVoJaYvHRhSDRqZc';
const genAI = new GoogleGenerativeAI(API_KEY);

export class FileProcessingService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Extract text from different file types
  async extractText(file: File): Promise<string> {
    const fileType = file.type;
    
    try {
      if (fileType === 'application/pdf') {
        return await this.extractPDFText(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await this.extractDOCXText(file);
      } else if (fileType === 'text/plain') {
        return await this.extractPlainText(file);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text from ${file.name}: ${error.message}`);
    }
  }

  private async extractPDFText(file: File): Promise<string> {
    // For PDF extraction, we'll use a simple approach
    // In production, you'd want to use a proper PDF parsing library
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // This is a simplified approach - in reality, you'd need a PDF parser
        // For now, we'll return a placeholder that indicates PDF processing is needed
        resolve(`[PDF Content from ${file.name}]\nThis is extracted text from the PDF file. In a production environment, this would contain the actual extracted text using a PDF parsing library.`);
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async extractDOCXText(file: File): Promise<string> {
    // For DOCX extraction, we'll use a simple approach
    // In production, you'd want to use a proper DOCX parsing library
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // This is a simplified approach - in reality, you'd need a DOCX parser
        resolve(`[DOCX Content from ${file.name}]\nThis is extracted text from the DOCX file. In a production environment, this would contain the actual extracted text using a DOCX parsing library.`);
      };
      reader.onerror = () => reject(new Error('Failed to read DOCX file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async extractPlainText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  // Generate AI-powered summaries and notes
  async processContent(text: string, options: ProcessingOptions): Promise<{
    summary?: string;
    revisionNotes?: string;
    keyPoints?: string[];
    concepts?: string[];
  }> {
    const results: any = {};

    try {
      if (options.summaryLength) {
        results.summary = await this.generateSummary(text, options.summaryLength);
      }

      if (options.includeRevisionNotes) {
        results.revisionNotes = await this.generateRevisionNotes(text);
      }

      if (options.includeKeyPoints) {
        results.keyPoints = await this.extractKeyPoints(text);
      }

      if (options.includeConcepts) {
        results.concepts = await this.extractConcepts(text);
      }

      return results;
    } catch (error) {
      console.error('Content processing error:', error);
      throw new Error(`Failed to process content: ${error.message}`);
    }
  }

  private async generateSummary(text: string, length: 'short' | 'medium' | 'long'): Promise<string> {
    const lengthInstructions = {
      short: 'in 2-3 sentences',
      medium: 'in 1-2 paragraphs',
      long: 'in 3-4 detailed paragraphs'
    };

    const prompt = `
    Please provide a comprehensive summary of the following educational content ${lengthInstructions[length]}:

    ${text}

    Focus on the main concepts, key learning objectives, and important details that students should remember.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private async generateRevisionNotes(text: string): Promise<string> {
    const prompt = `
    Create concise revision notes from the following educational content. Format them as bullet points with clear headings:

    ${text}

    Structure the notes with:
    - Main topics and subtopics
    - Key definitions
    - Important formulas or concepts
    - Examples and applications
    - Quick review points

    Make them suitable for quick review before exams.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private async extractKeyPoints(text: string): Promise<string[]> {
    const prompt = `
    Extract the most important key points from the following educational content. Return them as a numbered list:

    ${text}

    Focus on:
    - Core concepts and principles
    - Important facts and figures
    - Critical learning objectives
    - Essential takeaways

    Limit to 10-15 key points maximum.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const points = response.text().split('\n').filter(line => line.trim().length > 0);
    return points;
  }

  private async extractConcepts(text: string): Promise<string[]> {
    const prompt = `
    Identify and list the main concepts, terms, and definitions from the following educational content:

    ${text}

    Return only the concept names/terms, one per line. Focus on:
    - Technical terms
    - Key concepts
    - Important definitions
    - Subject-specific vocabulary

    Limit to 20 concepts maximum.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const concepts = response.text().split('\n').filter(line => line.trim().length > 0);
    return concepts;
  }
}

export const fileProcessingService = new FileProcessingService();