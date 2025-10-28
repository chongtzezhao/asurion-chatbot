import {
  HfInference, InferenceClientError, InferenceClientHubApiError, InferenceClientProviderApiError,
  InferenceClientProviderOutputError
} from "@huggingface/inference";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class HuggingFaceService {
  private client: HfInference;
  private model: string = "meta-llama/Llama-3.1-8B-Instruct";

  constructor(apiKey: string) {
    this.client = new HfInference(apiKey);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      // Format messages for the chat completion
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullResponse = '';

      // Use chatCompletion with streaming
      const stream = this.client.chatCompletionStream({
        model: this.model,
        messages: formattedMessages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
      });

      // Collect the streamed response
      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const delta = chunk.choices[0].delta;
          if (delta.content) {
            fullResponse += delta.content;
          }
        }
      }

      if (!fullResponse) {
        throw new Error('No response generated from the model');
      }

      return fullResponse.trim();

    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      
      if (error instanceof InferenceClientProviderApiError) {
        // Handle API errors (e.g., rate limits, authentication issues)
        console.error("Provider API Error:", error.message);
        throw new Error(`API Error: ${error.message}`);
        
      } else if (error instanceof InferenceClientHubApiError) {
        // Handle Hub API errors
        console.error("Hub API Error:", error.message);
        throw new Error(`Hub API Error: ${error.message}`);
        
      } else if (error instanceof InferenceClientProviderOutputError) {
        // Handle malformed responses from providers
        console.error("Provider Output Error:", error.message);
        throw new Error(`Output Error: ${error.message}`);
        
      } else if (error instanceof InferenceClientError) {
        // Catch all errors from @huggingface/inference
        console.error("Error from InferenceClient:", error);
        throw new Error(`Inference Error: ${error.message}`);
        
      } else {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
        throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }
  }

  // Alternative method without streaming for simpler use cases
  async generateResponseNonStreaming(messages: ChatMessage[]): Promise<string> {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.client.chatCompletion({
        model: this.model,
        messages: formattedMessages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
      });

      if (response.choices && response.choices.length > 0) {
        const content = response.choices[0].message.content;
        if (content) {
          return content.trim();
        }
      }

      throw new Error('No response generated from the model');

    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      
      if (error instanceof InferenceClientProviderApiError) {
        console.error("Provider API Error:", error.message);
        throw new Error(`API Error: ${error.message}`);
        
      } else if (error instanceof InferenceClientHubApiError) {
        console.error("Hub API Error:", error.message);
        throw new Error(`Hub API Error: ${error.message}`);
        
      } else if (error instanceof InferenceClientProviderOutputError) {
        console.error("Provider Output Error:", error.message);
        throw new Error(`Output Error: ${error.message}`);
        
      } else if (error instanceof InferenceClientError) {
        console.error("Error from InferenceClient:", error);
        throw new Error(`Inference Error: ${error.message}`);
        
      } else {
        console.error("Unexpected error:", error);
        throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }
  }
}