const inventoryState = {};
async function updateInventoryState() {
    const inventoryData = await getInventoryData();
    inventoryData.forEach(item => {
        inventoryState[item.ingredient] = item.remaining;
    });
}

const buttons = document.querySelectorAll('.menu-item');


// Add a click event listener to each button
buttons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove 'active' class from all buttons
        buttons.forEach(btn => btn.classList.remove('active'));

        // Add 'active' class to the clicked button
        this.classList.add('active');
    });
});


   
// Sample product data structure with prices
const productData = {
    'Burgers': [
        { name: 'Classic Burger', price: 39, ingredients: { Buns: 2, Patties: 2 }},
        { name: 'Egg Sandwich', price: 45, ingredients: { Buns: 2, Egg: 2 }},
        { name: 'Cheese Burger', price: 49, ingredients: { Buns: 2, Patties: 2, Cheese: 2 }},
        { name: 'Ham Sandwich', price: 45, ingredients: { Buns: 2, 'Ham/Bacon': 2, Cheese: 2 } },
        { name: 'Chicken Sandwich', price: 45, ingredients: { Buns: 1, Chicken: 1, Cheese: 1, Cabbage: 1 }}
    ],
    'Hotdog Sandwich': [
        { name: 'Hotdog Sandwich', price: 49, ingredients: { Hotdog: 2, 'Hotdog Buns': 2 } },
        { name: 'Footlong', price: 50, ingredients: { 'Footlong Buns': 2, Footlong: 2 } },
        { name: 'Hungarian Sandwich', price: 60, ingredients: { 'Footlong Buns': 2, Hungarian: 1 }, }
    ],
    'Fries': [
        { name: 'Small Fries', price: 20, ingredients: { Potato: 1, 'Flavored Powder': 1 } },
        { name: 'Medium Fries', price: 30, ingredients: { Potato: 2, 'Flavored Powder': 1 } },
        { name: 'Large Fries', price: 40, ingredients: { Potato: 3, 'Flavored Powder': 2 } },
        { name: 'Barkada Fries', price: 60, ingredients: { Potato: 4, 'Flavored Powder': 3 } },
        { name: 'Fries with Drinks', price: 45, ingredients: { Potato: 1, 'Flavored Powder': 1, 'Juice Powder': 1 } }
    ],
    'Nuggets': [ 
        { name: 'Chicken Nuggets', price: 59, ingredients: { 'Raw Chicken Nuggets': 5 } },
        { name: 'Chicken Pop', price: 59, ingredients: { 'Raw Chicken Pop': 5 } },
        { name: 'Fish Fillet', price: 59, ingredients: { 'Raw Fish Fillet': 5 } }
    ],
    'Fried Noodles': [
        { name: 'Plain Fried Noodles', price: 35, ingredients: { Noodles: 1 } },
        { name: 'Fried Noodles w/ 2 siomai', price: 45, ingredients: { Noodles: 1, 'Small Siomai': 2 } },
        { name: 'Fried Noodles w/ 2 siomai & Egg', price: 60, ingredients: { Noodles: 1, 'Small Siomai': 2, Egg: 2 } }
    ],
    'Other': [
        { name: 'Cheese', price: 10, ingredients: { Cheese: 1 } },
        { name: 'Egg', price: 15, ingredients: { Egg: 1 } },
        { name: 'Bacon', price: 15, ingredients: { 'Ham/Bacon': 1 } },
        { name: 'Coleslaw', price: 10, ingredients: { Coleslaw: 1 } },
        { name: 'Siomai', price: 5, ingredients: { Siomai: 1 } },
        { name: 'Shanghai', price: 8, ingredients: { Shanghai: 1 } }
    ]
};



// Initialize summary data
let summary = [];
let totalItems = 0;
let totalAmount = 0;

// Modify the updateSummary function to allow editing quantities
// Function to update the total of a row when quantity is changed in qty-cell
function attachQtyChangeListeners() {
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('input', async function() {
            const index = this.dataset.index;
            const newQty = parseInt(this.value) || 0;
            const item = summary[index];
            
            // Get current inventory data
            const inventoryData = await getInventoryData();
            
            // Calculate total required ingredients for new quantity
            const requiredIngredients = {};
            Object.entries(item.ingredients).forEach(([ingredient, amount]) => {
                requiredIngredients[ingredient] = amount * newQty;
            });
            
            // Check if enough stock exists
            let hasEnoughStock = true;
            let insufficientIngredients = [];
            
            for (const [ingredient, required] of Object.entries(requiredIngredients)) {
                const inventoryItem = inventoryData.find(i => i.ingredient === ingredient);
                if (!inventoryItem || inventoryItem.remaining < required) {
                    hasEnoughStock = false;
                    insufficientIngredients.push(ingredient);
                }
            }
            
            if (!hasEnoughStock) {
                alert(`Cannot update quantity: Insufficient stock for ${insufficientIngredients.join(', ')}`);
                this.value = item.qty; // Reset to previous quantity
                return;
            }
            
            // Update quantity if stock is sufficient
            item.qty = newQty;
            updateSummary();
        });
    });
}


async function getInventoryData() {
    try {
        const response = await fetch('http://localhost:3000/api/inventory');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        
        // Get current date in MM/DD/YYYY format
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
        
        return data.filter(item => item.date === currentDate);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return [];
    }
}





// Modified updateSummary function to attach listeners
function updateSummary() {
    const summaryBody = document.getElementById('summary-body');
    summaryBody.innerHTML = ''; // Clear current summary

    // Populate summary table with editable quantity cells
    summary.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td class="qty-cell">
                <input type="number" min="0" value="${item.qty}" data-index="${index}" class="qty-input" />
            </td>
            <td>₱ ${item.price.toFixed(2)}</td>
            <td>₱ ${(item.price * item.qty).toFixed(2)}</td>
         
            <td style="padding-left: 10px;"> <!-- Adding left padding for space -->
                <span class="void-button" data-index="${index}" style="cursor: pointer; font-weight: bold; color: red;">X</span>
            </td>
                   `;

        summaryBody.appendChild(row);
    });

    // Attach event listeners to qty inputs and void buttons
    attachQtyChangeListeners();
    attachVoidButtonListeners();

    // Update totals
    totalItems = summary.reduce((total, item) => total + item.qty, 0);
    totalAmount = summary.reduce((total, item) => total + (item.price * item.qty), 0);
    document.getElementById('total-items').innerText = totalItems;
    document.getElementById('total-amount').innerText = totalAmount.toFixed(2);
}

// Attach void button listeners
function attachVoidButtonListeners() {
    document.querySelectorAll('.void-button').forEach(span => {
        span.addEventListener('click', function () {
            const index = this.dataset.index;
            summary.splice(index, 1); // Remove the item from the summary array
            updateSummary(); // Refresh the summary display after voiding an item
        });
    });
}

// Function to update summary quantities
function updateSummaryQuantities() {
    // Select all input fields with the 'qty-input' class
    const qtyInputs = document.querySelectorAll('.qty-input');
    
    qtyInputs.forEach(input => {
        const index = input.dataset.index; // Retrieve index from data attribute
        const newQty = parseInt(input.value); // Get the updated quantity
        
        // Update the quantity in the summary array
        if (newQty >= 0) {
            summary[index].qty = newQty;
        }
    });

    // Refresh the summary display to reflect updated quantities and totals
    updateSummary();
}

function checkIngredientAvailability(requiredIngredients, inventoryData) {
    for (const [ingredient, amount] of Object.entries(requiredIngredients)) {
        const inventoryItem = inventoryData.find(item => item.ingredient === ingredient);
        
        if (!inventoryItem || inventoryItem.remaining < amount) {
            return false;
        }
    }
    return true;
}

// Updated updateInventory function
async function updateInventory(orderItems) {
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });

    for (const item of orderItems) {
        const product = Object.values(productData)
            .flat()
            .find(p => p.name === item.product_name);

        if (product && product.ingredients) {
            for (const [ingredient, amount] of Object.entries(product.ingredients)) {
                const totalUsed = amount * item.total_item;
                
                try {
                    const response = await fetch('http://localhost:3000/api/inventory/update', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ingredient: ingredient,
                            used: totalUsed,
                            date: currentDate
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update inventory');
                    }
                } catch (error) {
                    console.error(`Error updating inventory for ${ingredient}:`, error);
                }
            }
        }
    }
}
// Function to order now
// Modify the orderNow function
// Modified orderNow function with inventory tracking
async function orderNow(productName) {
    // Update inventory state first
    await updateInventoryState();
    
    const product = Object.values(productData).flat().find(p => p.name === productName);
    
    if (product) {
        // Calculate total ingredients needed including existing orders
        const totalIngredientsNeeded = {};
        
        // Add ingredients from existing orders
        summary.forEach(item => {
            Object.entries(item.ingredients).forEach(([ingredient, amount]) => {
                totalIngredientsNeeded[ingredient] = (totalIngredientsNeeded[ingredient] || 0) + (amount * item.qty);
            });
        });
        
        // Add ingredients for new order
        Object.entries(product.ingredients).forEach(([ingredient, amount]) => {
            totalIngredientsNeeded[ingredient] = (totalIngredientsNeeded[ingredient] || 0) + amount;
        });
        
        // Check if enough stock for all ingredients
        const insufficientIngredients = [];
        Object.entries(totalIngredientsNeeded).forEach(([ingredient, needed]) => {
            if (!inventoryState[ingredient] || inventoryState[ingredient] < needed) {
                insufficientIngredients.push(ingredient);
            }
        });
        
        if (insufficientIngredients.length > 0) {
            alert(`Insufficient stock for: ${insufficientIngredients.join(', ')}`);
            return;
        }
        
        // If sufficient stock, add to summary
        const existingItem = summary.find(item => item.name === productName);
        if (existingItem) {
            existingItem.qty++;
        } else {
            summary.push({
                name: productName,
                qty: 1,
                price: product.price,
                ingredients: product.ingredients
            });
        }
        
        // Update inventory state
        Object.entries(product.ingredients).forEach(([ingredient, amount]) => {
            inventoryState[ingredient] -= amount;
        });
        
        updateSummary();
    }
}



// Function to clear the summary
function clearSummary() {
    summary = []; // Reset summary
    updateSummary(); // Refresh the summary display
}



// Function to show products based on the selected menu item
function showProduct(category) {
    const productDisplay = document.getElementById('product-display');

    let products = '';

    switch (category) {
        case 'Burgers':
            products = `
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Classic_B.png');" onclick="showModal('Classic Burger', 'Pictures/Pics_burger/Classic_B.png')"></div>
                    <button class="order-button" onclick="orderNow('Classic Burger')">Classic Burger</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Egg_S.png');" onclick="showModal('Egg Sandwich', 'Pictures/Pics_burger/Egg_S.png')"></div>
                    <button class="order-button" onclick="orderNow('Egg Sandwich')">Egg Sandwich</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Cheese_B.png');" onclick="showModal('Cheese Burger', 'Pictures/Pics_burger/Cheese_B.png')"></div>
                    <button class="order-button" onclick="orderNow('Cheese Burger')">Cheese Burger</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Ham_S.png');" onclick="showModal('Ham Sandwich', 'Pictures/Pics_burger/Ham_S.png')"></div>
                    <button class="order-button" onclick="orderNow('Ham Sandwich')">Ham Sandwich</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Chicken_S.png');" onclick="showModal('Chicken Sandwich', 'Pictures/Pics_burger/Chicken_S.png')"></div>
                    <button class="order-button" onclick="orderNow('Chicken Sandwich')">Chicken Sandwich</button>
                </div>`;
            break;
        case 'Hotdog':
            products = `
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Hotdog_S.png');" onclick="showModal('Hotdog Sandwich', 'Pictures/Pics_burger/Hotdog_S.png')"></div>
                    <button class="order-button" onclick="orderNow('Hotdog Sandwich')">Hotdog Sandwich</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Footlong.png');" onclick="showModal('Footlong', 'Pictures/Pics_burger/Footlong.png')"></div>
                    <button class="order-button" onclick="orderNow('Footlong')">Footlong</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Hungarian_S.png');" onclick="showModal('Hungarian Sandwich', 'Pictures/Pics_burger/Hungarian_S.png')"></div>
                    <button class="order-button" onclick="orderNow('Hungarian Sandwich')">Hungarian Sandwich</button>
                </div>`;
            break;
        case 'Fries':
            products = `
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fries_S.png');" onclick="showModal('Small Fries', 'Pictures/Pics_burger/Fries_S.png')"></div>
                    <button class="order-button" onclick="orderNow('Small Fries')">Small Fries</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fries_M.png');" onclick="showModal('Medium Fries', 'Pictures/Pics_burger/Fries_M.png')"></div>
                    <button class="order-button" onclick="orderNow('Medium Fries')">Medium Fries</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fries_L.png');" onclick="showModal('Large Fries', 'Pictures/Pics_burger/Fries_L.png')"></div>
                    <button class="order-button" onclick="orderNow('Large Fries')">Large Fries</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fries_B.png');" onclick="showModal('Barkada Fries', 'Pictures/Pics_burger/Fries_B.png')"></div>
                    <button class="order-button" onclick="orderNow('Barkada Fries')">Barkada Fries</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fries_D.png');" onclick="showModal('Fries with Drinks', 'Pictures/Pics_burger/Fries_D.png')"></div>
                    <button class="order-button" onclick="orderNow('Fries with Drinks')">Fries with Drinks</button>
                </div>`;
            break;
        case 'Nuggets':
            products = `
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Nuggets.png');" onclick="showModal('Chicken Nuggets', 'Pictures/Pics_burger/Nuggets.png')"></div>
                    <button class="order-button" onclick="orderNow('Chicken Nuggets')">Chicken Nuggets</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Chicken_Pop.png');" onclick="showModal('Chicken Pop', 'Pictures/Pics_burger/Chicken_Pop.png')"></div>
                    <button class="order-button" onclick="orderNow('Chicken Pop')">Chicken Pop</button>
                </div>
                <div class="product-box">
                    <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fish_F.png');" onclick="showModal('Fish Fillet', 'Pictures/Pics_burger/Fish_F.png')"></div>
                    <button class="order-button" onclick="orderNow('Fish Fillet')">Fish Fillet</button>
                </div>`;
            break;
        // Additional cases for other categories would follow the same pattern.
        case 'Fried Noodles':
    products = `
        <div class="product-box">
            <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fried_N.png');" onclick="showModal('Plain Fried Noodles', 'Pictures/Pics_burger/Fried_N.png')"></div>
            <button class="order-button" onclick="orderNow('Plain Fried Noodles')">Plain Fried Noodles</button>
        </div>
        <div class="product-box">
            <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fried_N.png');" onclick="showModal('Fried Noodles w/ 2 siomai', 'Pictures/Pics_burger/Fried_N.png')"></div>
            <button class="order-button" onclick="orderNow('Fried Noodles w/ 2 siomai')">Fried Noodles w/ 2 siomai</button>
        </div>
        <div class="product-box">
            <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fried_N.png');" onclick="showModal('Fried Noodles w/ 2 siomai & Egg', 'Pictures/Pics_burger/Fried_N.png')"></div>
            <button class="order-button" onclick="orderNow('Fried Noodles w/ 2 siomai & Egg')">Fried Noodles w/ 2 siomai & Egg</button>
        </div>`;
    break;

case 'Other':
    products = `
        <div class="add-scroll">
        <div class="scroll-container"> <!-- Added scroll container -->
            <div class="product-box1">
                <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fried_N.png');" onclick="showModal('Cheese', 'Pictures/Pics_burger/Fried_N.png')"></div>
                <button class="order-button" onclick="orderNow('Cheese')">Cheese</button>
            </div>
            <div class="product-box1">
                <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fried_N.png');" onclick="showModal('Egg', 'Pictures/Pics_burger/Fried_N.png')"></div>
                <button class="order-button" onclick="orderNow('Egg')">Egg</button>
            </div>
            <div class="product-box1">
                <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fried_N.png');" onclick="showModal('Bacon', 'Pictures/Pics_burger/Fried_N.png')"></div>
                <button class="order-button" onclick="orderNow('Bacon')">Bacon</button>
            </div>
            <div class="product-box1">
                <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fried_N.png');" onclick="showModal('Coleslaw', 'Pictures/Pics_burger/Fried_N.png')"></div>
                <button class="order-button" onclick="orderNow('Coleslaw')">Coleslaw</button>
            </div>
            <div class="product-box1">
                <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fried_N.png');" onclick="showModal('Siomai', 'Pictures/Pics_burger/Fried_N.png')"></div>
                <button class="order-button" onclick="orderNow('Siomai')">Siomai</button>
            </div>
            <div class="product-box1">
                <div class="item-image" style="background-image: url('Pictures/Pics_burger/Fried_N.png');" onclick="showModal('Shanghai', 'Pictures/Pics_burger/Fried_N.png')"></div>
                <button class="order-button" onclick="orderNow('Shanghai')">Shanghai</button>
            </div>
        </div>
        </div>`;
    break;
    }

    productDisplay.innerHTML = products;
}


// Modified showModal function to use SQLite data
async function showModal(title, imageUrl) {
    try {
        const modal = document.getElementById('product-modal');
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const ingredientTable = document.getElementById('ingredient-table').getElementsByTagName('tbody')[0];

        modalImage.src = imageUrl;
        modalTitle.textContent = title;
        ingredientTable.innerHTML = '';

        const product = Object.values(productData)
            .flat()
            .find(p => p.name === title);

        if (product && product.ingredients) {
            const inventoryData = await getInventoryData();
            const currentDate = new Date().toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            });

            for (const [ingredient, cost] of Object.entries(product.ingredients)) {
                const inventoryItem = inventoryData.find(item => 
                    item.ingredient === ingredient && 
                    item.date === currentDate
                );

                const stock = inventoryItem ? inventoryItem.stock : 0;
                const remaining = inventoryItem ? inventoryItem.remaining : 0;

                const row = ingredientTable.insertRow();
                row.innerHTML = `
                    <td>${ingredient}</td>
                    <td>${cost}</td>
                    <td>${stock}</td>
                    <td>${remaining}</td>
                `;
            }
        }

        modal.style.display = 'block';
    } catch (error) {
        console.error('Error displaying modal:', error);
        alert('Error loading inventory data. Please try again.');
    }
}

// I add this one rn for  minus the stock
function updateIngredientStock(orderItems) {
    orderItems.forEach(item => {
        const product = Object.values(productData)
            .flat()
            .find(p => p.name === item.name);
            
        if (product && product.ingredients) {
            Object.entries(product.ingredients).forEach(([ingredient, cost]) => {
                if (ingredientStock[ingredient]) {
                    ingredientStock[ingredient] -= cost * item.qty;
                }
            });
        }
    });
}

function closeModal() {
    const modalinfo = document.getElementById('product-modal');
    modalinfo.style.display = 'none';
}


function updateTimeAndDate() {
    const now = new Date();
    
    // Format time in HH:MM:SS format
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // Format date in YYYY-MM-DD format
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Update HTML elements
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

// Call the function immediately and then every second to keep it updated
updateTimeAndDate();
setInterval(updateTimeAndDate, 1000);

function goToInventory() {
    window.location.href = "../Inventory/inventory.html";
}


document.getElementById('process-button').addEventListener('click', function() {
    // Your processing code here
});
// Modify the process button event listener
document.getElementById('process-button').addEventListener('click', async () => {
    const transactions = summary.map(item => ({
        name: item.name,
        category: item.category,
        totalItem: item.qty,
        totalAmount: item.price * item.qty,
        addOns: item.addOns || []
    }));

    try {
        const response = await fetch('http://localhost:3000/processTransaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactions)
        });

        const result = await response.json();
        if (result.success) {
            await updateInventory(transactions);
            clearSummary();
            alert('Transaction processed successfully!');
        }
    } catch (error) {
        console.error('Error processing transaction:', error);
        alert('Failed to process transaction');
    }
});



// Helper function to get product ingredients
function getProductIngredients(productName) {
    const product = Object.values(productData)
        .flat()
        .find(p => p.name === productName);
    return product ? product.ingredients : {};
}



// Cancel button functionality with confirmation
document.getElementById('cancel-button').addEventListener('click', function() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = "block"; // Show the modal
});

// Close the modal
document.getElementById('close-modal').onclick = function() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = "none"; // Hide the modal
}

// Confirm cancel action
document.getElementById('confirm-cancel').onclick = function() {
    clearSummary(); // Clear the summary
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = "none"; // Hide the modal
    alert("Transaction has been cancelled."); // Inform the user
}

// Deny cancel action
document.getElementById('deny-cancel').onclick = function() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = "none"; // Hide the modal
}

// Close modal if clicked outside of modal
window.onclick = function(event) {
    const modal = document.getElementById('confirmation-modal');
    if (event.target == modal) {
        modal.style.display = "none"; // Hide the modal
    }
}


function getProductCategory(productName) {
    // Search through productData to find the category
    for (const [category, products] of Object.entries(productData)) {
        if (products.some(product => product.name === productName)) {
            return category;
        }
    }
    return 'Other'; // Default category if not found
}

async function processTransaction() {
    const summaryRows = document.querySelectorAll('#summary-body tr');
    const transactions = Array.from(summaryRows).map(row => {
        const cells = row.querySelectorAll('td');
        const name = cells[0].textContent;
        
        return {
            product_name: name,
            category: getProductCategory(name),
            total_item: parseInt(cells[1].querySelector('input').value),
            total_amount: parseFloat(cells[3].textContent.replace('₱', '')),
            date: new Date().toISOString().split('T')[0]
        };
    });

    const response = await fetch('http://localhost:3000/process-transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactions)
    });

    const result = await response.json();
    
    if (result.success) {
        await updateInventory(transactions);
        clearSummary();
        return result;
    }
    
    throw new Error(result.message || 'Transaction processing failed');
}


async function refreshModal(title, imageUrl) {
    const product = Object.values(productData)
        .flat()
        .find(p => p.name === title);

    if (product && product.ingredients) {
        const inventoryData = await getInventoryData();
        const ingredientTable = document.getElementById('ingredient-table').getElementsByTagName('tbody')[0];
        ingredientTable.innerHTML = '';

        for (const [ingredient, cost] of Object.entries(product.ingredients)) {
            const inventoryItem = inventoryData.find(item => item.ingredient === ingredient);
            const stock = inventoryItem ? inventoryItem.stock : 0;
            const remaining = inventoryItem ? inventoryItem.remaining : 0;

            const row = ingredientTable.insertRow();
            row.innerHTML = `
                <td>${ingredient}</td>
                <td>${cost}</td>
                <td>${stock}</td>
                <td>${remaining}</td>
            `;
        }
    }
}

// Function to get the category of a product
function getCategory(productName) {
    for (const category in productData) {
        const product = productData[category].find(item => item.name === productName);
        if (product) {
            return category;
        }
    }
    return null; // Return null if not found
}

// Function to format the date
function formatDate(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-GB', options).split('/').reverse().join('/'); // Converts to DD/MM/YYYY format
}

// Function to format the time
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // 24-hour format
}


async function validateOrderStock(orderItems) {
    await updateInventoryState();
    
    const totalRequired = {};
    
    // Calculate total ingredients needed
    orderItems.forEach(item => {
        const product = Object.values(productData).flat().find(p => p.name === item.name);
        if (product && product.ingredients) {
            Object.entries(product.ingredients).forEach(([ingredient, amount]) => {
                totalRequired[ingredient] = (totalRequired[ingredient] || 0) + (amount * item.qty);
            });
        }
    });
    
    // Check against inventory
    const insufficientItems = Object.entries(totalRequired)
        .filter(([ingredient, needed]) => !inventoryState[ingredient] || inventoryState[ingredient] < needed)
        .map(([ingredient]) => ingredient);
    
    return {
        valid: insufficientItems.length === 0,
        insufficientItems
    };
}

