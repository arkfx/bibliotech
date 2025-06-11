import { getBaseUrl } from '../config.js';

const API_BASE = getBaseUrl();

export async function saveReadingProgress(livroId, currentPage, totalPages, progressPercentage) {
    try {
        const response = await fetch(`${API_BASE}/progresso-leitura`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                livro_id: livroId,
                current_page: currentPage,
                total_pages: totalPages,
                progress_percentage: progressPercentage
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving reading progress:', error);
        throw error;
    }
}

export async function getReadingProgress(livroId) {
    try {
        const response = await fetch(`${API_BASE}/progresso-leitura/${livroId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (response.status === 404) {
            return null; // No progress found
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.status === 'success' ? result.data : null;
    } catch (error) {
        console.error('Error getting reading progress:', error);
        throw error;
    }
}

export async function getBooksInProgress() {
    try {
        const response = await fetch(`${API_BASE}/livros-em-progresso`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.status === 'success' ? result.data : [];
    } catch (error) {
        console.error('Error getting books in progress:', error);
        return [];
    }
}

export async function getRecentlyReadBooks(limit = 5) {
    try {
        const response = await fetch(`${API_BASE}/livros-lidos-recentemente?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.status === 'success' ? result.data : [];
    } catch (error) {
        console.error('Error getting recently read books:', error);
        return [];
    }
}

export async function deleteReadingProgress(livroId) {
    try {
        const response = await fetch(`${API_BASE}/progresso-leitura/${livroId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting reading progress:', error);
        throw error;
    }
} 