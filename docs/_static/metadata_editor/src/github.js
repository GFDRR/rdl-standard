import { packageDataset, sanitizeFilename, cleanEmptyValues, getFilteredFormData } from './utils.js';


// GitHub Configuration
const TARGET_REPO_OWNER = 'GFDRR';
const TARGET_REPO_NAME = 'rdl-jkan';
const TARGET_REPO = `${TARGET_REPO_OWNER}/${TARGET_REPO_NAME}`;
const TARGET_BRANCH = 'rdl-1.0'; // Target branch for PRs

// Initialize GitHub auth state on page load
window.addEventListener('DOMContentLoaded', () => {
    checkGithubAuthState();
});

export function checkGithubAuthState() {
    const token = sessionStorage.getItem('github_access_token');
    const username = sessionStorage.getItem('github_username');

    if (token && username) {
        document.getElementById('notAuthenticated').style.display = 'none';
        document.getElementById('authenticated').style.display = 'block';
        document.getElementById('githubUsername').textContent = username;

        // Show publish button if authenticated
        const publishBtn = document.getElementById('publishToGithub');
        if (publishBtn) publishBtn.disabled = false;
    } else {
        document.getElementById('notAuthenticated').style.display = 'block';
        document.getElementById('authenticated').style.display = 'none';

        // Disable publish button if not authenticated
        const publishBtn = document.getElementById('publishToGithub');
        if (publishBtn) publishBtn.disabled = true;
    }
}

function logoutGithub() {
    sessionStorage.removeItem('github_access_token');
    sessionStorage.removeItem('github_username');
    checkGithubAuthState();
    showGithubStatus('info', 'Signed out successfully');
}

function showGithubStatus(type, message) {
    const statusDiv = document.getElementById('githubConfigStatus');
    let className = 'alert ';
    switch(type) {
        case 'success': className += 'alert-success'; break;
        case 'error': className += 'alert-danger'; break;
        case 'info': className += 'alert-info'; break;
        default: className += 'alert-secondary';
    }
    statusDiv.className = className;
    statusDiv.innerHTML = message;
    statusDiv.style.display = 'block';
}

async function authenticateWithToken() {
    const token = document.getElementById('githubToken').value.trim();

    if (!token) {
        showGithubStatus('error', 'Please enter a GitHub token');
        return;
    }

    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        showGithubStatus('error', 'Invalid token format. Token should start with "ghp_" or "github_pat_"');
        return;
    }

    showGithubStatus('info', '🔄 Verifying token...');

    try {
        // Verify token by getting user info
        const userResponse = await githubRequest(token, 'user');

        // Token is valid, store it
        sessionStorage.setItem('github_access_token', token);
        sessionStorage.setItem('github_username', userResponse.login);

        checkGithubAuthState();
        showGithubStatus('success', `✅ Successfully authenticated as ${userResponse.login}!`);

    } catch (error) {
        console.error('Token verification error:', error);
        showGithubStatus('error', `❌ Authentication failed: ${error.message}`);
    }
}

async function testGithubConnection() {
    const token = sessionStorage.getItem('github_access_token');
    const statusDiv = document.getElementById('githubConfigStatus');

    if (!token) {
        showGithubStatus('error', 'Please sign in with GitHub first');
        return;
    }

    showGithubStatus('info', 'Testing connection...');

    try {
        const userResponse = await githubRequest(token, 'user');
        showGithubStatus('success', `✅ Connected as ${userResponse.login}`);
    } catch (error) {
        showGithubStatus('error', `❌ Connection failed: ${error.message}`);
    }
}

async function ensureUserFork(token, username) {
    showGithubStatus('info', '🔍 Checking for existing fork...');

    try {
        // Check if user already has a fork
        const forkResponse = await fetch(`https://api.github.com/repos/${username}/${TARGET_REPO_NAME}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (forkResponse.ok) {
            const forkData = await forkResponse.json();
            if (forkData.fork && forkData.parent.full_name === TARGET_REPO) {
                showGithubStatus('success', '✅ Fork already exists');
                return `${username}/${TARGET_REPO_NAME}`;
            }
        }

        // Fork doesn't exist, create it
        showGithubStatus('info', '🍴 Creating fork in your account...');
        const createForkResponse = await githubRequest(token, `repos/${TARGET_REPO}/forks`, {
            method: 'POST',
            body: JSON.stringify({})
        });

        // Wait a moment for fork to be ready
        showGithubStatus('info', '⏳ Waiting for fork to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        showGithubStatus('success', `✅ Fork created: ${createForkResponse.full_name}`);
        return createForkResponse.full_name;

    } catch (error) {
        throw new Error(`Failed to create fork: ${error.message}`);
    }
}


export async function publishDataToGithub(currentFormData, activeSections) {
    const token = sessionStorage.getItem('github_access_token');
    const username = sessionStorage.getItem('github_username');
    const baseBranch = TARGET_BRANCH;
    const datasetTitle = document.getElementById('datasetTitle').value;
    const statusDiv = document.getElementById('githubConfigStatus');

    // Input validation
    if (!token || !username) {
        showGithubStatus('error', 'Please sign in with GitHub first');
        return;
    }

    if (!datasetTitle) {
        showGithubStatus('error', 'Please enter a dataset title');
        return;
    }

    // Check if form data is valid and has essential fields
    if (!currentFormData || Object.keys(currentFormData).length === 0) {
        showGithubStatus('error', 'No metadata to publish. Please fill out the form first.');
        return;
    }

    // Warn if essential fields are missing
    if (!currentFormData.title && !currentFormData.name) {
        if (!confirm('No title found in metadata. Continue publishing?')) {
            return;
        }
    }

    // Disable publish button during operation
    const publishBtn = document.getElementById('publishToGithub');
    publishBtn.disabled = true;

    showGithubStatus('info', '🚀 Starting publication process...');

    try {
        // Package dataset first to get the ID
        const filteredData = getFilteredFormData(currentFormData, activeSections);
        const packagedData = packageDataset(filteredData, currentFormData);

        // Clean empty values before publishing
        const cleanedData = cleanEmptyValues(packagedData);

        // Generate filename from dataset ID, fallback to title-based naming
        const datasetId = cleanedData.datasets?.[0]?.id;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = datasetId ? `${datasetId}.json` : `${sanitizeFilename(datasetTitle)}-${timestamp}.json`;
        const branchName = datasetId ? `rdl-dataset-${datasetId}` : `rdl-dataset-${sanitizeFilename(datasetTitle)}-${timestamp}`;

        // Step 1: Ensure user has a fork
        const userForkRepo = await ensureUserFork(token, username);

        // Step 2: Get base branch SHA from MAIN repo (not fork)
        showGithubStatus('info', '📡 Getting base branch information...');
        const baseResponse = await githubRequest(token, `repos/${TARGET_REPO}/git/ref/heads/${baseBranch}`);
        const baseSha = baseResponse.object.sha;

        // Step 3: Create new branch in USER'S FORK
        showGithubStatus('info', '🌿 Creating branch in your fork...');
        try {
            await githubRequest(token, `repos/${userForkRepo}/git/refs`, {
                method: 'POST',
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha: baseSha
                })
            });
        } catch (error) {
            // If branch already exists, try to update it
            if (error.message.includes('422')) {
                showGithubStatus('info', '🔄 Branch exists, updating...');
                await githubRequest(token, `repos/${userForkRepo}/git/refs/heads/${branchName}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        sha: baseSha,
                        force: true
                    })
                });
            } else {
                throw error;
            }
        }

        // Step 4: Create/update file in USER'S FORK
        showGithubStatus('info', '📄 Uploading dataset file to your fork...');
        const jsonString = JSON.stringify(cleanedData, null, 2);
        const content = btoa(unescape(encodeURIComponent(jsonString)));
        const commitMessage = `Add RDLS dataset: ${datasetTitle}

published via RDLS Metadata Editor
 ${cleanedData.datasets?.[0]?.title || 'Untitled'}
ption: ${cleanedData.datasets?.[0]?.description ? cleanedData.datasets[0].description.substring(0, 100) + '...' : 'No description'}
amp: ${new Date().toISOString()}`;

        await githubRequest(token, `repos/${userForkRepo}/contents/_datasets/json/${filename}`, {
            method: 'PUT',
            body: JSON.stringify({
                message: commitMessage,
                content: content,
                branch: branchName
            })
        });

        // Step 5: Create Pull Request from USER'S FORK to MAIN REPO
        showGithubStatus('info', '🔄 Creating pull request...');
        const prResponse = await githubRequest(token, `repos/${TARGET_REPO}/pulls`, {
            method: 'POST',
            body: JSON.stringify({
                title: `Add RDLS Dataset: ${datasetTitle}`,
                head: `${username}:${branchName}`, // Important: user:branch format
                base: baseBranch,
                body: `## New RDLS Dataset Submission

t Title:** ${cleanedData.datasets?.[0]?.title || 'Untitled'}

ption:**
dData.datasets?.[0]?.description || 'No description provided'}

* \`_datasets/json/${filename}\`

sion Details:**
hed via RDLS Metadata Editor
amp: ${new Date().toISOString()}
tion: ✅ Passed
ted by: @${username}


ull request was automatically generated by the RDLS Metadata Editor.`
            })
        });

        // Success!
        const prUrl = prResponse.html_url;
        showGithubStatus('success', `🎉 Successfully published! <a href="${prUrl}" target="_blank">View Pull Request #${prResponse.number}</a>`);

        // Show confirmation and offer to close modal
        setTimeout(() => {
            if (confirm(`Dataset successfully published as Pull Request #${prResponse.number}!\n\nWould you like to view it on GitHub now?`)) {
                window.open(prUrl, '_blank');
            }
            // Close modal after 2 seconds regardless
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('githubConfigModal'));
                if (modal) modal.hide();
            }, 2000);
        }, 1000);

    } catch (error) {
        console.error('GitHub publish error:', error);
        let errorMessage = 'Publication failed: ';

        if (error.message.includes('fork')) {
            errorMessage += 'Could not create fork. Please try again or create a fork manually.';
        } else if (error.message.includes('422')) {
            errorMessage += 'Branch or PR already exists. Try with a different dataset title.';
        } else if (error.message.includes('403')) {
            errorMessage += 'Access denied. Please check your GitHub permissions.';
        } else if (error.message.includes('401')) {
            errorMessage += 'Authentication failed. Please sign in again.';
        } else if (error.message.includes('404')) {
            errorMessage += 'Repository not found.';
        } else if (error.message.toLowerCase().includes('network')) {
            errorMessage += 'Network connection error. Please check your internet connection.';
        } else {
            errorMessage += error.message;
        }

        showGithubStatus('error', `❌ ${errorMessage}`);
    } finally {
        // Re-enable button
        publishBtn.disabled = false;
    }
}

async function githubRequest(token, endpoint, options = {}) {
    const config = {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        ...options
    };

    const response = await fetch(`https://api.github.com/${endpoint}`, config);

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}
