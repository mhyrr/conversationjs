import { config } from './config';

class ThreadApp {
    constructor() {
        this.threadManager = new ThreadManager();
        this.ui = new UI();
        this.auth = new Auth();
        this.dataService = config.dataSource === 'github' 
            ? new GitHubAPI()
            : new LocalDataService();
        window.app = this;
        this.init();
    }

    async init() {
        if (config.dataSource === 'local') {
            await this.auth.loadLocalParticipants();
        }
        await this.loadThreads();
    }

    async loadThreads() {
        const threads = await this.dataService.getThreads();
        this.ui.renderThreads(threads);
    }
}

class LocalDataService {
    async getThreads() {
        const response = await fetch(config.conversationPath);
        return response.text();
    }

    async updateThread(content) {
        console.log('In dev mode, updates are logged:', content);
        return true;
    }
}

class Auth {
    constructor() {
        this.currentUser = null;
        this.userDisplayNames = new Map();
        this.initAuthButtons();
        if (config.dataSource === 'local') {
            this.loadLocalParticipants();
        }
    }

    async loadLocalParticipants() {
        const response = await fetch('/participants.json');
        const data = await response.json();
        data.participants.forEach(p => {
            this.userDisplayNames.set(p.username, p.displayName);
        });
    }

    setCurrentUser(githubUser) {
        this.currentUser = {
            username: githubUser.login,
            displayName: githubUser.name || githubUser.login,
            avatar: githubUser.avatar_url
        };
        this.userDisplayNames.set(this.currentUser.username, this.currentUser.displayName);
    }

    getDisplayName(username) {
        return this.userDisplayNames.get(username) || username;
    }

    initAuthButtons() {
        document.getElementById('login-button').addEventListener('click', () => this.login());
        document.getElementById('logout').addEventListener('click', () => this.logout());
    }

    async checkAuthStatus() {
        // GitHub OAuth check implementation
    }

    async login() {
        // GitHub OAuth login implementation
    }

    logout() {
        // Logout implementation
    }
}

class ThreadManager {
    constructor() {
        this.threads = new Map();
    }

    async createThread(title, content) {
        // Create new thread implementation
    }

    async addReply(threadId, parentId, content) {
        // Add reply implementation
    }

    async moveThread(threadId, newParentId) {
        // Move thread implementation
    }
}

class UI {
    constructor() {
        this.threadContainer = document.getElementById('thread-container');
        this.initEventListeners();
    }

    initEventListeners() {
        this.threadContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('collapse-toggle') || e.target.closest('.collapse-toggle')) {
                const button = e.target.classList.contains('collapse-toggle') ? 
                    e.target : e.target.closest('.collapse-toggle');
                const messageId = button.dataset.messageId;
                const icon = button.querySelector('.collapse-icon');
                const messageGroup = button.closest('.message-group');
                
                // Find both the message content and replies container
                const messageContent = messageGroup.querySelector('.message-content-body');
                const repliesContainer = messageGroup.querySelector(`.message-replies[data-parent="${messageId}"]`);
                
                if (messageContent) messageContent.classList.toggle('collapsed');
                if (repliesContainer) repliesContainer.classList.toggle('collapsed');
                
                icon.textContent = messageContent?.classList.contains('collapsed') ? '▸' : '▾';
            }
        });
    }

    renderThreads(markdownContent) {
        const threads = this.parseMarkdown(markdownContent);
        this.threadContainer.innerHTML = threads.map(thread => this.renderThread(thread)).join('');
    }

    renderThread(thread) {
        return `
            <div class="thread">
                <h3>${thread.title}</h3>
                <div class="thread-messages">
                    ${this.renderMessageGroup(thread.messages)}
                </div>
            </div>
        `;
    }

    renderMessageGroup(messages) {
        if (!messages || messages.length === 0) return '';
        
        let currentDepth = 0;
        let currentGroup = [];
        let output = '';

        messages.forEach((msg, index) => {
            if (msg.depth === 0) {
                // If we have a pending group, render it
                if (currentGroup.length) {
                    output += this.renderMessageWithReplies(currentGroup[0], currentGroup.slice(1));
                    currentGroup = [];
                }
                currentGroup = [msg];
            } else if (msg.depth > currentDepth) {
                currentGroup.push(msg);
            } else if (msg.depth === 0 || msg.depth <= messages[index - 1]?.depth) {
                // Start a new group when depth decreases or equals previous
                if (currentGroup.length) {
                    output += this.renderMessageWithReplies(currentGroup[0], currentGroup.slice(1));
                    currentGroup = [msg];
                }
            }
            currentDepth = msg.depth;
        });

        // Render any remaining group
        if (currentGroup.length) {
            output += this.renderMessageWithReplies(currentGroup[0], currentGroup.slice(1));
        }

        return output;
    }

    renderMessageWithReplies(mainMsg, replies) {
        const nestedReplies = this.buildReplyTree(replies);
        const displayName = window.app.auth.getDisplayName(mainMsg.author);
        
        return `
            <div class="message-group" data-depth="${mainMsg.depth}">
                <div class="message-content">
                    <div class="message-header">
                        ${nestedReplies.length ? `
                            <button class="collapse-toggle" data-message-id="${mainMsg.id}">
                                <span class="collapse-icon">▾</span>
                            </button>
                        ` : ''}
                        <div class="message-prefix">- @${displayName} [${mainMsg.timestamp}]:</div>
                    </div>
                    <div class="message-content-body">
                        ${mainMsg.content.map(p => `<p>${p}</p>`).join('')}
                    </div>
                </div>
                ${this.renderNestedReplies(nestedReplies, mainMsg.id)}
            </div>
        `;
    }

    buildReplyTree(replies) {
        const replyMap = new Map();
        const topLevel = [];
        
        replies.forEach(reply => {
            if (!replyMap.has(reply.depth)) {
                replyMap.set(reply.depth, []);
            }
            replyMap.get(reply.depth).push(reply);
        });
        
        return Array.from(replyMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([_, msgs]) => msgs)
            .flat();
    }

    renderNestedReplies(replies, parentId) {
        if (!replies.length) return '';
        
        return `
            <div class="message-replies" data-parent="${parentId}">
                ${replies.map(reply => {
                    const displayName = window.app.auth.getDisplayName(reply.author);
                    return `
                        <div class="message-content" style="margin-left: ${(reply.depth - 1) * 2}rem">
                            <div class="message-prefix">- @${displayName} [${reply.timestamp}]:</div>
                            ${reply.content.map(p => `<p>${p}</p>`).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    parseMarkdown(content) {
        const lines = content.split('\n');
        const threads = [];
        let currentThread = null;
        let currentMessage = null;

        lines.forEach((line, index) => {
            if (line.startsWith('### ')) {
                if (currentThread) threads.push(currentThread);
                currentThread = {
                    title: line.replace('### ', '').replace(/ \[.*\]/, ''),
                    messages: []
                };
            } else if (line.match(/^\s*- @/)) {
                const indentLevel = (line.match(/^\s*/)[0].length) / 2;
                const match = line.match(/- @(\w+) \[(.*?)\]: (.*)/);
                if (match) {
                    currentMessage = {
                        author: match[1],
                        timestamp: match[2],
                        content: [match[3]],
                        depth: indentLevel
                    };
                    currentThread.messages.push(currentMessage);
                }
            } else if (line.trim() && currentMessage) {
                currentMessage.content.push(line.trim());
            }
        });

        if (currentThread) threads.push(currentThread);
        return threads;
    }
}

class GitHubAPI {
    constructor() {
        this.baseUrl = 'https://api.github.com';
        this.repo = ''; // Add your repo details
    }

    async getThreads() {
        // Fetch threads from GitHub implementation
    }

    async updateThread(path, content, sha) {
        // Update thread content implementation
    }
}

// Initialize the app
const app = new ThreadApp(); 