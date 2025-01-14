import { MessageAPI, MessageUpdate, MessageReply, ThreadCreate, MessageMove, MessageDelete } from './types';
import { getCurrentUser } from '../auth';
import { 
  updateMarkdownContent, 
  addReplyToMarkdown, 
  createNewThread,
  moveMessageToThread, 
  deleteMessageFromMarkdown 
} from '../../shared/markdown-operations';

const REPO_OWNER = 'mhyrr';
const REPO_NAME = 'conversationjs';
const FILE_PATH = 'public/data/conversation.md';
const BRANCH = 'main'; // or whatever your default branch is

export class GitHubMessageAPI implements MessageAPI {
  private async getFileContent(): Promise<{ content: string; sha: string }> {
    const user = getCurrentUser();
    console.log('Getting file content with user:', user?.login);
    if (!user?.accessToken) throw new Error('No auth token');

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`;
    console.log('Fetching from:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('GitHub API error getting content:', {
        status: response.status,
        statusText: response.statusText,
        error
      });
      throw new Error(`Failed to fetch file: ${error.message}`);
    }
    
    const data = await response.json();
    console.log('Got file content with sha:', data.sha);
    return {
      content: atob(data.content),
      sha: data.sha
    };
  }

  private async updateFile(content: string, sha: string, message: string): Promise<boolean> {
    const user = getCurrentUser();
    console.log('Updating file as user:', user?.login);
    if (!user?.accessToken) return false;

    try {
      const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
      console.log('Updating file at:', url);
      console.log('Commit message:', message);

      const body = {
        message,
        content: btoa(content),
        sha,
        branch: BRANCH,
        committer: {
          name: user.login,
          email: `${user.login}@users.noreply.github.com`
        }
      };
      console.log('Request body:', { ...body, content: '[content omitted]' });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('GitHub API error updating file:', {
          status: response.status,
          statusText: response.statusText,
          error
        });
        return false;
      }

      const result = await response.json();
      console.log('Update successful:', result);
      return true;
    } catch (error) {
      console.error('Failed to update file:', error);
      return false;
    }
  }

  async updateMessage(update: MessageUpdate): Promise<boolean> {
    try {
      const { content, sha } = await this.getFileContent();
      const updatedContent = updateMarkdownContent(content, update);
      return await this.updateFile(
        updatedContent, 
        sha,
        `Update message from ${update.messageAuthor}`
      );
    } catch (error) {
      console.error('Failed to update message:', error);
      return false;
    }
  }

  async replyToMessage(reply: MessageReply): Promise<boolean> {
    try {
      console.log('Starting reply to message:', {
        thread: reply.threadTitle,
        parent: {
          author: reply.parentAuthor,
          timestamp: reply.parentTimestamp
        },
        content: reply.content
      });

      const { content, sha } = await this.getFileContent();
      console.log('Got current content, generating updated content');
      
      const updatedContent = addReplyToMarkdown(content, reply);
      console.log('Generated updated content');

      const success = await this.updateFile(
        updatedContent,
        sha,
        `Add reply from ${reply.author}`
      );
      console.log('Reply operation completed:', success);
      return success;
    } catch (error) {
      console.error('Failed to add reply:', error);
      return false;
    }
  }

  async createThread(thread: ThreadCreate): Promise<boolean> {
    try {
      const { content, sha } = await this.getFileContent();
      const updatedContent = createNewThread(content, thread);
      return await this.updateFile(
        updatedContent,
        sha,
        `Create new thread: ${thread.title}`
      );
    } catch (error) {
      console.error('Failed to create thread:', error);
      return false;
    }
  }

  async moveToThread(move: MessageMove): Promise<boolean> {
    try {
      const { content, sha } = await this.getFileContent();
      const updatedContent = moveMessageToThread(content, move);
      return await this.updateFile(
        updatedContent,
        sha,
        `Move message to thread: ${move.newTitle}`
      );
    } catch (error) {
      console.error('Failed to move message:', error);
      return false;
    }
  }

  async deleteMessage(del: MessageDelete): Promise<boolean> {
    try {
      const { content, sha } = await this.getFileContent();
      const updatedContent = deleteMessageFromMarkdown(content, del);
      return await this.updateFile(
        updatedContent,
        sha,
        `Delete message from ${del.messageAuthor}`
      );
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  }
} 