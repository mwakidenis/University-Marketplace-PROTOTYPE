// Main JavaScript file to connect frontend to backend
// This would be linked in each HTML file when ready to connect

// Global configuration
const API_URL = '/api'; // Replace with actual API URL when deployed

// ============================================
// Homepage functionality (index.html)
// ============================================

// Fetch and display all products
async function fetchItems() {
    try {
        showLoader();
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const items = await response.json();
        displayItems(items);
        hideLoader();
        
        return items;
    } catch (error) {
        console.error('Error fetching items:', error);
        showErrorMessage('Could not load items. Please try again later.');
        hideLoader();
        return [];
    }
}

function displayItems(items) {
    const itemsContainer = document.getElementById('items-container');
    if (!itemsContainer) return;
    
    // Clear existing items
    itemsContainer.innerHTML = '';
    
    if (items.length === 0) {
        itemsContainer.innerHTML = `
            <div class="col-span-full py-10 text-center">
                <p class="text-gray-500 text-lg">No items found. Be the first to post something!</p>
                <a href="post-item.html" class="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full">
                    Post an Item
                </a>
            </div>
        `;
        return;
    }
    
    // Create item cards with animation delay
    items.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 item-card';
        itemCard.style.setProperty('--animation-order', index);
        
        itemCard.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/300x200'}" alt="${item.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <div class="flex justify-between items-start">
                    <h2 class="text-xl font-bold text-gray-800">${item.name}</h2>
                    <span class="text-lg font-bold text-green-600">$${item.price}</span>
                </div>
                <p class="text-gray-600 mt-2 text-sm line-clamp-2">${item.description}</p>
                <div class="mt-4 flex justify-between items-center">
                    <a href="item.html?id=${item.id}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</a>
                    <a href="https://wa.me/${item.contact}?text=Hi! I'm interested in your ${item.name} on College Marketplace" 
                       class="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded-lg text-sm font-medium transition-colors duration-300">
                        Contact Seller
                    </a>
                </div>
            </div>
        `;
        
        itemsContainer.appendChild(itemCard);
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    let allItems = []; // Store all items for client-side filtering
    let debounceTimer;
    
    // Fetch all items initially
    fetchItems().then(items => {
        allItems = items;
    });
    
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                displayItems(allItems);
                return;
            }
            
            // Filter items client-side
            const filteredItems = allItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm) || 
                item.description.toLowerCase().includes(searchTerm)
            );
            
            displayItems(filteredItems);
        }, 300); // Debounce delay
    });
}

// ============================================
// Post Item functionality (post-item.html)
// ============================================

function setupItemForm() {
    const form = document.getElementById('post-item-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Posting...';
            
            const formData = new FormData(form);
            
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                body: formData,
                // Note: Don't set Content-Type header when sending FormData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Show success message
            showSuccessMessage('Your item has been posted successfully!');
            
            // Redirect to homepage after a brief delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error posting item:', error);
            showErrorMessage('Failed to post your item. Please try again.');
            
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

// ============================================
// Item Details functionality (item.html)
// ============================================

async function fetchItemDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    
    if (!itemId) {
        showErrorMessage('Item not found');
        return null;
    }
    
    try {
        showLoader();
        const response = await fetch(`${API_URL}/products/${itemId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const item = await response.json();
        displayItemDetails(item);
        hideLoader();
        
        // Fetch recommended items
        fetchRecommendedItems(itemId);
        
        return item;
    } catch (error) {
        console.error('Error fetching item details:', error);
        showErrorMessage('Could not load item details. Please try again later.');
        hideLoader();
        return null;
    }
}

async function fetchRecommendedItems(currentItemId) {
    try {
        const response = await fetch(`${API_URL}/products/recommended?id=${currentItemId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const items = await response.json();
        displayRecommendedItems(items);
    } catch (error) {
        console.error('Error fetching recommended items:', error);
        const recommendationsSection = document.getElementById('recommendations-section');
        if (recommendationsSection) {
            recommendationsSection.style.display = 'none';
        }
    }
}

// ============================================
// Initialize functionality based on current page
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Detect current page and initialize appropriate functionality
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
            fetchItems();
            setupSearch();
            break;
        
        case 'post-item.html':
            setupItemForm();
            break;
            
        case 'item.html':
            fetchItemDetails();
            break;
    }
});
