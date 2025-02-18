import { MessageAPI, MessageUpdate, MessageReply, ThreadCreate, MessageMove, MessageDelete } from './types';
import { getCurrentUser } from '../auth';
import { 
  updateMarkdownContent, 
  addReplyToMarkdown, 
  createNewThread,
  moveMessageToThread, 
  deleteMessageFromMarkdown 
} from '../../shared/markdown-operations';
import config from '../../../participants.json';

const { owner: REPO_OWNER, name: REPO_NAME, branch: BRANCH } = config.repo;
const FILE_PATH = 'public/data/conversation.md';

export class GitHubMessageAPI implements MessageAPI {
  private async getFileContent(): Promise<{ content: string; sha: string }> {
    const user = getCurrentUser();
    console.log('Getting file content with user:', user?.login);
    if (!user?.accessToken) throw new Error('No auth token');

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`;
    console.log('Fetching from:', url);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!response.ok) {
        console.error('GitHub API error getting content:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText
        });
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      const data = JSON.parse(responseText);
      console.log('Got file content with sha:', data.sha);
      return {
        content: atob(data.content),
        sha: data.sha
      };
    } catch (error) {
      console.error('Detailed fetch error:', error);
      throw error;
    }
  }

  private async updateFile(content: string, sha: string, message: string): Promise<boolean> {
    const user = getCurrentUser();
    console.log('Updating file as user:', user?.login);
    if (!user?.accessToken) return false;

    try {
      const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
      console.log('Updating file at:', url);
      console.log('Commit message:', message);

      const encodeUnicode = (str: string) => {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
          function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16))
          }));
      };

      const body = {
        message,
        content: encodeUnicode(content),
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

      const responseText = await response.text();
      console.log('Raw update response:', responseText);

      if (!response.ok) {
        console.error('GitHub API error updating file:', {
          status: response.status,
          statusText: response.statusText,
          response: responseText
        });
        return false;
      }

      const result = JSON.parse(responseText);
      console.log('Update successful:', result);
      return true;
    } catch (error) {
      console.error('Detailed update error:', error);
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
      console.log('=== Starting GitHub Reply Flow ===');
      console.log('1. Reply details:', {
        thread: reply.threadTitle,
        parent: {
          author: reply.parentAuthor,
          timestamp: reply.parentTimestamp
        },
        content: reply.content
      });

      console.log('2. Fetching current content from GitHub...');
      const { content, sha } = await this.getFileContent();
      console.log('3. Got content with SHA:', sha);
      
      console.log('4. Generating updated content...');
      const updatedContent = addReplyToMarkdown(content, reply);
      console.log('5. Content updated, committing to GitHub...');

      const success = await this.updateFile(
        updatedContent,
        sha,
        `Add reply from ${reply.author}`
      );
      console.log('6. GitHub commit result:', success);
      console.log('=== End GitHub Reply Flow ===');
      return success;
    } catch (error) {
      console.error('!!! GitHub Reply Flow Failed:', error);
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