export async function fetchOLabsContent(): Promise<string> {
    const pageContent = document.body.innerText; 
    return `Summarize this educational content:\n${pageContent}`;
  }
  