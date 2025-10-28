# Asurion Chatbot

A modern React-based chatbot application powered by Meta's Llama 3.1 8B Instruct model via Hugging Face Inference API.

## Features

- 💬 Real-time chat interface with AI-powered responses
- 🤖 Integration with Llama 3.1 8B Instruct model using official `@huggingface/inference` SDK
- 💾 Persistent chat history using localStorage
- 🎨 Modern, responsive UI design
- ⚡ TypeScript for type safety
- 🗑️ Clear chat history functionality
- ⏱️ Typing indicators and timestamps
- 🔄 Streaming responses for better UX

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Hugging Face account and API token

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd asurion_chatbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Hugging Face API Key

1. Create a Hugging Face account at [https://huggingface.co](https://huggingface.co)
2. Generate an API token at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Add your API key to the `.env` file:

```env
REACT_APP_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### 4. Run the Application

```bash
npm start
```

The application will open in your browser at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
asurion_chatbot/
├── public/
│   ├── asurion.ico          # Favicon (add your own)
│   └── index.html            # HTML template
├── src/
│   ├── components/
│   │   ├── ChatWindow.tsx    # Main chat container
│   │   ├── ChatWindow.css    # Chat window styles
│   │   ├── ChatBubble.tsx    # Individual message component
│   │   ├── ChatBubble.css    # Message bubble styles
│   │   ├── MessageInput.tsx  # Input field component
│   │   └── MessageInput.css  # Input field styles
│   ├── config/
│   │   └── systemPrompt.ts   # System prompt configuration
│   ├── services/
│   │   └── huggingfaceService.ts  # Hugging Face API integration
│   ├── App.tsx               # Main application component
│   ├── App.css               # Application styles
│   └── index.tsx             # Application entry point
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies
└── README.md                 # This file
```

## Components

### ChatWindow
The main container component that manages:
- Message state and history
- API calls to Hugging Face
- Chat history persistence
- Error handling

### ChatBubble
Displays individual messages with:
- Different styling for user vs bot messages
- Timestamps
- Smooth animations

### MessageInput
Handles user input with:
- Text input field
- Send button
- Enter key support
- Disabled state during bot responses

## API Integration

The chatbot uses the official `@huggingface/inference` SDK with the following configuration:

- **Package**: `@huggingface/inference`
- **Model**: `meta-llama/Llama-3.1-8B-Instruct`
- **Max Tokens**: 500
- **Temperature**: 0.7
- **Top P**: 0.95
- **Streaming**: Enabled for real-time responses

The service maintains conversation context by sending the last 10 messages along with each new request. It uses the `chatCompletionStream` method for streaming responses, providing a better user experience.

### Error Handling

The service includes comprehensive error handling for:
- `InferenceClientProviderApiError` - API errors (rate limits, authentication)
- `InferenceClientHubApiError` - Hub API errors
- `InferenceClientProviderOutputError` - Malformed responses
- `InferenceClientError` - General inference errors

## Chat History

Chat history is automatically saved to the browser's localStorage and persists across sessions. Users can clear the history using the trash icon button in the chat header.

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder. Creates a fully static export using webpack that can be deployed to any static hosting service.

**For detailed build and deployment instructions, see [BUILD.md](BUILD.md)**

### `npm run eject`
**Note: this is a one-way operation. Once you eject, you can't go back!**

## Customization

### Changing the System Prompt
The system prompt is now stored in a separate configuration file for easy customization. Edit [`src/config/systemPrompt.ts`](src/config/systemPrompt.ts:1):

```typescript
export const SYSTEM_PROMPT = `Your custom system prompt here.

You can include:
- Multiple lines
- Bullet points
- Specific instructions
- Role definitions`;
```

This approach makes it easy to:
- Update the prompt without touching component code
- Version control prompt changes separately
- Share prompts across different environments
- Test different prompts easily

### Adjusting API Parameters
Modify the parameters in `src/services/huggingfaceService.ts`:

```typescript
parameters: {
  max_new_tokens: 500,    // Maximum response length
  temperature: 0.7,       // Randomness (0-1)
  top_p: 0.95,           // Nucleus sampling
}
```

### Styling
All component styles are in their respective CSS files and can be customized to match your brand.

## Troubleshooting

### API Key Issues
- Ensure your `.env` file is in the root directory
- Verify the API key is correct and has proper permissions
- Restart the development server after adding the API key

### Model Loading
The Hugging Face model may take a few seconds to load on the first request. Subsequent requests will be faster.

### CORS Errors
If you encounter CORS errors, ensure you're using the correct Hugging Face API endpoint and that your API key is valid.

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Keep your Hugging Face API key secure
- Consider implementing rate limiting for production use

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue in the repository.
