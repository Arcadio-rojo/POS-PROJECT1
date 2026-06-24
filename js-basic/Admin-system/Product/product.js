

const productData = {
    'Burgers': [
        { name: 'Classic Burger', price: 39, ingredients: { Buns: 2, Patties: 2 }, image: 'Classic_B.png'},
        { name: 'Egg Sandwich', price: 45, ingredients: { Buns: 2, Egg: 2 }, image: 'Egg_S.png'},
        { name: 'Cheese Burger', price: 49, ingredients: { Buns: 2, Patties: 2, Cheese: 2 }, image: 'Cheese_B.png'},
        { name: 'Ham Sandwich', price: 45, ingredients: { Buns: 2, 'Ham/Bacon': 2, Cheese: 2 }, image: 'Ham_S.png'},
        { name: 'Chicken Sandwich', price: 45, ingredients: { Buns: 1, Chicken: 1, Cheese: 1, Cabbage: 1 }, image: 'Chicken_S.png'}
    ],
    'Hotdog Sandwich': [
        { name: 'Hotdog Sandwich', price: 49, ingredients: { Hotdog: 2, 'Hotdog Buns': 2 }, image: 'Hotdog_S.png'},
        { name: 'Footlong', price: 50, ingredients: { 'Footlong Buns': 2, Footlong: 2 }, image: 'Footlong.png'},
        { name: 'Hungarian Sandwich', price: 60, ingredients: { 'Footlong Buns': 2, Hungarian: 1 }, image: 'Hungarian_S.png'}
    ],
    'Fries': [
        { name: 'Small Fries', price: 20, ingredients: { Potato: 1, 'Flavored Powder': 1 }, image: 'Fries_S.png'},
        { name: 'Medium Fries', price: 30, ingredients: { Potato: 2, 'Flavored Powder': 1 }, image: 'Fries_M.png'},
        { name: 'Large Fries', price: 40, ingredients: { Potato: 3, 'Flavored Powder': 2 }, image: 'Fries_L.png'},
        { name: 'Barkada Fries', price: 60, ingredients: { Potato: 4, 'Flavored Powder': 3 }, image: 'Fries_B.png'},
        { name: 'Fries with Drinks', price: 45, ingredients: { Potato: 1, 'Flavored Powder': 1, 'Juice Powder': 1 }, image: 'Fries_D.png'}
    ],
    'Nuggets': [
        { name: 'Chicken Nuggets', price: 59, ingredients: { 'Raw Chicken Nuggets': 5 }, image: 'Nuggets.png'},
        { name: 'Chicken Pop', price: 59, ingredients: { 'Raw Chicken Pop': 5 }, image: 'Chicken_Pop.png'},
        { name: 'Fish Fillet', price: 59, ingredients: { 'Raw Fish Fillet': 5 }, image: 'Fish_F.png'}
    ],
    'Fried Noodles': [
        { name: 'Plain Fried Noodles', price: 35, ingredients: { Noodles: 1 }, image: 'Fried_N.png'},
        { name: 'Fried Noodles w/ 2 siomai', price: 45, ingredients: { Noodles: 1, 'Small Siomai': 2 }, image: 'Fried_N.png'},
        { name: 'Fried Noodles w/ 2 siomai & Egg', price: 60, ingredients: { Noodles: 1, 'Small Siomai': 2, Egg: 2 }, image: 'Fried_N.png'}
    ],
    
};


   // Populate categories
   const categoryData = {
    "Burgers": ["Patties", "Buns", "Egg", "Chicken", "Ham/Bacon", "Cheese", "Cabbage"],
    "Hotdog Sandwich": ["Hungarian", "Footlong", "Hotdog", "Hotdog Buns", "Footlong Buns"],
    "Fries": ["Potato", "Juice Powder", "Flavored Powder"],
    "Nuggets": ["Raw Chicken Nuggets", "Raw Chicken Pop", "Raw Fish Fillet"],
    "Fried Noodles": ["Noodles", "Siomai", "Egg"],
};

document.addEventListener('DOMContentLoaded', () => {
    displayAllProducts();
});
function displayAllProducts() {
    const productDisplay = document.getElementById('productDisplay');
    
    const allProducts = Object.values(productData)
        .flat()
        .map(product => `
            <div class="product-box">
                <div class="close-button" onclick="removeProduct(this)">X</div>
                <div class="item-image" 
                     style="background-image: url('../../all/Employee-system/Transaction/Pictures/Pics_burger/${product.image}');"
                     onclick="showModal('${product.name}')">
                </div>
                <button class="product-title">${product.name}</button>
            </div>
        `).join('');
    
    productDisplay.innerHTML = `
        <button id="addProductButton" onclick="openAddProductModal()">+</button>
        ${allProducts}
    `;
}

function showModal(title) {
    const product = findProduct(title);
    
    let modal = document.getElementById('product-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    if (product) {
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <img src="../../all/Employee-system/Transaction/Pictures/Pics_burger/${product.image}" 
                     alt="${title}" id="modal-image">
                <h2 id="modal-title">${title}</h2>
               
                <table id="ingredient-table">
                    <thead>
                        <tr>
                            <th>Ingredient</th>
                            <th>Required</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(product.ingredients)
                            .map(([ingredient, amount]) => `
                                <tr>
                                    <td>${ingredient}</td>
                                    <td>${amount}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        modal.style.display = 'block';
    }
}

function findProduct(name) {
    return Object.values(productData)
        .flat()
        .find(product => product.name === name);
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function removeProduct(element) {
    element.parentElement.remove();
}
function openAddProductModal() {
    const modal = document.createElement('div');
    modal.id = 'add-product-modal';
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeAddProductModal()">&times;</span>
            <h2>Add New Product</h2>
            
            <div class="upload-section">
                <label for="productImage">Upload Product Image:</label>
                <input type="file" id="productImage" accept="image/*" multiple>
            </div>
            
            <div class="form-group">
                <label for="productName">Name of Product:</label>
                <input type="text" id="productName" placeholder="Enter product name" required>
            </div>
            
            <div class="form-group">
                <label for="categorySelect">Category:</label>
                <select id="categorySelect" onchange="updateIngredientOptions()">
                    <option value="">Select Category</option>
                    ${Object.keys(categoryData).map(category =>
                        `<option value="${category}">${category}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div id="ingredientsContainer">
                <div class="ingredient-row">
                    <select class="ingredient-select">
                        <option value="">Select Ingredient</option>
                    </select>
                    <input type="number" class="ingredient-cost" min="0" step="0.01" placeholder="Cost">
                    <button type="button" onclick="removeIngredientRow(this)">Remove</button>
                </div>
            </div>
            
            <button type="button" onclick="addIngredientRow()">Add Ingredient</button>
            
            <div class="modal-footer">
                <button type="button" onclick="closeAddProductModal()">Cancel</button>
                <button type="button" onclick="submitProduct()">Submit</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function updateIngredientOptions() {
    const category = document.getElementById('categorySelect').value;
    const ingredients = categoryData[category] || [];
    const ingredientSelects = document.querySelectorAll('.ingredient-select');

    ingredientSelects.forEach(select => {
        select.innerHTML = `
            <option value="">Select Ingredient</option>
            ${ingredients.map(ingredient =>
                `<option value="${ingredient}">${ingredient}</option>`
            ).join('')}
        `;
    });
}
function addIngredientRow() {
    const ingredientsContainer = document.getElementById('ingredientsContainer');
    const category = document.getElementById('categorySelect').value;
    const ingredients = categoryData[category] || [];

    const ingredientRow = document.createElement('div');
    ingredientRow.className = 'ingredient-row';

    ingredientRow.innerHTML = `
        <select class="ingredient-select">
            <option value="">Select Ingredient</option>
            ${ingredients.map(ingredient => `<option value="${ingredient}">${ingredient}</option>`).join('')}
        </select>
        <input type="number" class="ingredient-cost" min="0" step="0.01" placeholder="Cost">
        <button type="button" onclick="removeIngredientRow(this)">Remove</button>
    `;

    ingredientsContainer.appendChild(ingredientRow);
}

function removeIngredientRow(button) {
    const ingredientRow = button.parentElement;
    ingredientRow.remove();
}

function closeAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) {
        modal.remove();
    }
}
function getIngredientOptions() {
    const category = document.getElementById('categorySelect').value;
    const ingredients = categoryData[category] || [];
    return ingredients.map(ingredient =>
        `<option value="${ingredient}">${ingredient}</option>`
    ).join('');
}
function submitProduct() {
    const formData = new FormData();
    const productName = document.getElementById('productName').value;
    const category = document.getElementById('categorySelect').value;
    const imageFile = document.getElementById('productImage').files[0];

    // Validate required fields
    if (!productName || !category || !imageFile) {
        alert('Please fill in all required fields');
        return;
    }

    // Append form data
    formData.append('image', imageFile);
    formData.append('name', productName);
    formData.append('category', category);
    
    // Get ingredients
    const ingredients = Array.from(document.querySelectorAll('.ingredient-row'))
        .map(row => ({
            ingredient: row.querySelector('.ingredient-select').value,
            cost: parseFloat(row.querySelector('.ingredient-cost').value) || 0
        }))
        .filter(ing => ing.ingredient); // Only include ingredients with names

    formData.append('ingredients', JSON.stringify(ingredients));
    formData.append('total_item', '0');
    formData.append('total_amount', calculateTotalAmount(ingredients).toString());
    formData.append('transaction_id', `TXN${Date.now()}`);
    formData.append('date', new Date().toISOString().split('T')[0]);

    // Submit the form
    fetch('http://localhost:3000/api/products', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        closeAddProductModal();
        displayAllProducts();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add product: ' + (error.message || 'Unknown error'));
    });
}
function displayTable(selectedValue) {
    const productDisplay = document.getElementById('productDisplay');
    
    // Filter products based on selected category
    const filteredProducts = selectedValue === 'all' 
        ? Object.values(productData).flat()
        : productData[selectedValue] || [];
    
    const productsHTML = filteredProducts.map(product => `
        <div class="product-box">
            <div class="close-button" onclick="removeProduct(this)">X</div>
            <div class="item-image" 
                 style="background-image: url('../../all/Employee-system/Transaction/Pictures/Pics_burger/${product.image}');"
                 onclick="showModal('${product.name}')">
            </div>
            <button class="product-title">${product.name}</button>
        </div>
    `).join('');
    
    productDisplay.innerHTML = `
        <button id="addProductButton" onclick="openAddProductModal()">+</button>
        ${productsHTML}
    `; 
}


function calculateTotalAmount(ingredients) {
    return ingredients.reduce((total, item) => total + item.cost, 0);
}

function generateTransactionId() {
    return 'TXN' + Date.now();
}

function filterTable() {
    const searchInput = document.getElementById('searchBar').value.toLowerCase();
    const productBoxes = document.querySelectorAll('.product-box');
    
    productBoxes.forEach(box => {
        const productName = box.querySelector('.product-title').textContent.toLowerCase();
        
        if (productName.includes(searchInput)) {
            box.style.display = 'block';
        } else {
            box.style.display = 'none';
        }
    });
}

