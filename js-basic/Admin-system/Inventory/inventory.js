document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('posModal');
    const closeButton = document.querySelector('.close-button');
    const submitAddButton = document.getElementById('submitAdd');
    const dateTimeDisplay = document.getElementById('dateTimeDisplay');
    const inventoryTable = document.getElementById('inventory_tracking').querySelector('tbody');
    const categorySelect = document.getElementById('modalCategory');
    const ingredientSelect = document.getElementById('modalIngredient');
    const stockInput = document.getElementById('modalStock');
    const remainingInput = document.getElementById('modalRemaining');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const deleteButton = document.getElementById('deleteButton');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    const cancelDeleteButton = document.getElementById('cancelDeleteButton');
    const pinInput = document.getElementById('pinInput');
    const editButton = document.getElementById('editButton');
    const editModal2 = document.getElementById('editModal2');
    const closeEditModal2 = document.getElementById('closeEditModal2');
    const saveEditButton2 = document.getElementById('saveEditButton2');

    let currentStockData = {};

// Fetch and populate inventory data
fetchInventoryData();

// Fetch data from the server
function fetchInventoryData() {
    fetch('http://127.0.0.1:3000/api/inventory')
        .then(response => response.json())
        .then(data => {
            inventoryTable.innerHTML = ''; // Clear existing rows
            data.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.date}</td>
                        <td>${item.time}</td>
                        <td>${item.ingredient}</td>
                        <td>${item.category}</td>
                        <td>${item.stock}</td>
                        <td>${item.remaining}</td>
                        <td><input type="checkbox" class="select-row"></td>
                    </tr>`;
                inventoryTable.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Update the remaining value dynamically in the modal
ingredientSelect.addEventListener('change', updateRemainingValue);
categorySelect.addEventListener('change', updateRemainingValue);


function updateRemainingValue() {
    const selectedCategory = categorySelect.value.trim();
    const selectedIngredient = ingredientSelect.value.trim();

    let foundStock = null;
    let foundRemaining = null;

    // Loop through the inventory table rows to find a matching category and ingredient
    Array.from(inventoryTable.rows).forEach(row => {
        const category = row.cells[3].textContent.trim();
        const ingredient = row.cells[2].textContent.trim();

        if (category === selectedCategory && ingredient === selectedIngredient) {
            foundStock = parseInt(row.cells[4].textContent.trim(), 10) || 0;
            foundRemaining = parseInt(row.cells[5].textContent.trim(), 10) || 0;
        }
    });

    // Update the modal's Remaining Stock field
    remainingInput.value = foundRemaining !== null
        ? `Remaining Stock: ${foundRemaining}`
        : 'Remaining Stock: 0';

    // Optionally update stock placeholder
    stockInput.placeholder = foundStock !== null
        ? `Current Stock: ${foundStock}`
        : 'Enter Stock';
}



// Add new inventory item or update existing item
submitAddButton.addEventListener('click', function () {
    const category = categorySelect.value.trim();
    const ingredient = ingredientSelect.value.trim();
    const stockInput = parseInt(document.getElementById('modalStock').value, 10);
    const currentDate = new Date().toLocaleDateString();

    // Validate inputs
    if (!category || !ingredient || isNaN(stockInput)) {
        alert("Please complete all fields correctly.");
        return;
    }

    if (stockInput <= 0) {
        alert("Invalid input. Stock must be a positive number.");
        return;
    }

    let rowUpdated = false;

    // Loop through inventory table rows
    Array.from(inventoryTable.rows).forEach(row => {
        const rowDate = row.cells[0].textContent.trim();
        const currentIngredient = row.cells[2].textContent.trim();
        const currentCategory = row.cells[3].textContent.trim();
        
        // Only update if same date, ingredient and category match
        if (rowDate === currentDate && 
            currentCategory === category && 
            currentIngredient === ingredient) {
            
            const currentStock = parseInt(row.cells[4].textContent, 10) || 0;
            const currentRemaining = parseInt(row.cells[5].textContent, 10) || 0;
            
            const newStock = currentStock + stockInput;
            const newRemaining = currentRemaining + stockInput;

            row.cells[4].textContent = newStock;
            row.cells[5].textContent = newRemaining;
            row.cells[1].textContent = new Date().toLocaleTimeString();

            rowUpdated = true;

            updateDatabase(ingredient, category, newStock, newRemaining);
        }
    });

    // If no matching row for today's date, create new one starting from 0 + new stock
    if (!rowUpdated) {
        const newRow = `
            <tr>
                <td>${currentDate}</td>
                <td>${new Date().toLocaleTimeString()}</td>
                <td>${ingredient}</td>
                <td>${category}</td>
                <td>${stockInput}</td>
                <td>${stockInput}</td>
                <td><input type="checkbox" class="select-row"></td>
            </tr>`;
        inventoryTable.insertAdjacentHTML('beforeend', newRow);

        insertOrUpdateDatabase(
            currentDate,
            new Date().toLocaleTimeString(),
            ingredient,
            category,
            stockInput,
            stockInput
        );
    }

    clearModalInputs();
    modal.style.display = 'none';
    alert('Inventory updated successfully!');
});



// Insert or update the database
function insertOrUpdateDatabase(date, time, ingredient, category, stock, remaining) {
    return fetch('http://127.0.0.1:3000/api/inventory', {
        method: 'POST', // or PUT if updating an existing entry
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, ingredient, category, stock, remaining })
    });
}

// Helper function to clear modal inputs
function clearModalInputs() {
    categorySelect.value = '';
    ingredientSelect.value = '';
    stockInput.value = '';
    remainingInput.value = '';
}


    // Select all checkboxes functionality
    selectAllCheckbox.addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('.select-row');
        checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
    });

   // Edit functionality
 // Modify the edit button click handler
editButton.addEventListener('click', function () {
    const checkboxes = inventoryTable.querySelectorAll('input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('Please select at least one row to edit.');
        return;
    }

    const currentDate = new Date().toLocaleDateString();
    const selectedRowsData = [];
    let hasNonCurrentDate = false;

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const rowDate = row.cells[0].textContent;
        
        if (rowDate !== currentDate) {
            hasNonCurrentDate = true;
            return;
        }

        selectedRowsData.push({
            date: rowDate,
            time: row.cells[1].textContent,
            ingredient: row.cells[2].textContent,
            category: row.cells[3].textContent,
            stock: row.cells[4].textContent,
            remaining: row.cells[5].textContent
        });
    });

    if (hasNonCurrentDate) {
        alert('You can only edit stock for the current date.');
        return;
    }

    populateEditModal(selectedRowsData);
    editModal2.style.display = 'block';
});

function populateEditModal(selectedRowsData) {
    const selectedRowsTable = document.getElementById('selectedRowsTable');
    selectedRowsTable.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Ingredient</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Remaining</th>
            </tr>
        </thead>
        <tbody>
            ${selectedRowsData.map(rowData => `
            <tr>
                <td>${rowData.date}</td>
                <td>${rowData.time}</td>
                <td>${rowData.ingredient}</td>
                <td>${rowData.category}</td>
                <td>${rowData.stock}</td>
                <td><input type="number" class="editRemainingInput" 
                    value="${rowData.remaining}" 
                    max="${rowData.remaining}"
                    min="0"
                    data-original="${rowData.remaining}"></td>
            </tr>
            `).join('')}
        </tbody>
    `;

    // Add event listeners to remaining inputs
    document.querySelectorAll('.editRemainingInput').forEach(input => {
        input.addEventListener('change', (e) => {
            const newValue = parseInt(e.target.value);
            const originalValue = parseInt(e.target.dataset.original);
            
            if (newValue > originalValue) {
                alert('Cannot increase remaining value');
                e.target.value = originalValue;
                return;
            }
            
            if (newValue < 0) {
                alert('Cannot set negative remaining value');
                e.target.value = 0;
                return;
            }
        });
    });
}
// Add this function to update the database and refresh the table
async function saveEditChanges(updatedRows) {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/inventory/batch-update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedRows)
        });

        if (!response.ok) throw new Error('Failed to update inventory');

        // Refresh the inventory table
        fetchInventoryData();
        return true;
    } catch (error) {
        console.error('Error updating inventory:', error);
        return false;
    }
}

// Modify the save edit button handler
saveEditButton2.addEventListener('click', async function () {
    const remainingInputs = document.querySelectorAll('.editRemainingInput');
    const updatedRows = [];

    remainingInputs.forEach(input => {
        const row = input.closest('tr');
        const newRemaining = parseInt(input.value);
        const stock = parseInt(row.cells[4].textContent);

        if (isNaN(newRemaining) || newRemaining < 0) {
            alert('Invalid remaining value. Please enter a non-negative number.');
            return;
        }

        updatedRows.push({
            ingredient: row.cells[2].textContent,
            category: row.cells[3].textContent,
            stock: stock,
            remaining: newRemaining
        });
    });

    if (updatedRows.length > 0) {
        const success = await saveEditChanges(updatedRows);
        if (success) {
            alert('Changes saved successfully.');
            editModal2.style.display = 'none';
        }
    }
});



// Update database function for each row
function updateDatabase(ingredient, category, stock, remaining) {
    return fetch('http://127.0.0.1:3000/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient, category, stock, remaining })
    });
}



    // Delete functionality
    deleteButton.addEventListener('click', function () {
        const checkboxes = inventoryTable.querySelectorAll('input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            alert('Select at least one row to delete.');
            return;
        }
        deleteModal.style.display = 'block';
    });

    confirmDeleteButton.addEventListener('click', function () {
        const pin = pinInput.value;
        if (pin !== '1234') {
            alert('Incorrect PIN.');
            return;
        }

        const checkboxes = inventoryTable.querySelectorAll('.select-row:checked');
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const ingredient = row.cells[2].textContent;
            const category = row.cells[3].textContent;
            row.remove();
            deleteFromDatabase(ingredient, category);
        });

        deleteModal.style.display = 'none';
    });

    function deleteFromDatabase(ingredient, category) {
        return fetch('http://127.0.0.1:3000/api/inventory', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredient, category })
        });
    }

    // Utility functions
    function clearModalInputs() {
        categorySelect.value = '';
        ingredientSelect.value = '';
        stockInput.value = '';
        remainingInput.value = '';
    }
 
    // Populate categories
    const categoryData = {
        "Burgers": ["Patties", "Buns", "Egg", "Chicken", "Ham/Bacon", "Cheese", "Cabbage"],
        "Hotdog": ["Hungarian", "Footlong", "Hotdog", "Hotdog Buns", "Footlong Buns"],
        "Fries": ["Potato", "Juice Powder", "Flavored Powder"],
        "Nuggets": ["Raw Chicken Nuggets", "Raw Chicken Pop", "Raw Fish Fillet"],
        "Fried Noodles": ["Noodles", "Siomai", "Egg"],
    };

    Object.keys(categoryData).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    categorySelect.addEventListener('change', function () {
        const selectedCategory = categorySelect.value;
        ingredientSelect.innerHTML = '<option value="">--Select Ingredient--</option>';
    
        if (selectedCategory && categoryData[selectedCategory]) {
            // Add ingredients without duplicates
            const uniqueIngredients = [...new Set(categoryData[selectedCategory])];
            uniqueIngredients.forEach(ingredient => {
                const option = document.createElement('option');
                option.value = ingredient;
                option.textContent = ingredient;
                ingredientSelect.appendChild(option);
            });
            ingredientSelect.disabled = false;
        } else {
            ingredientSelect.disabled = true;
        }
   
    });
    // Populate Category Select Dropdown
    function populateCategorySelect() {
        Object.keys(categoryData).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // Display current date and time
    function getCurrentDateTime() {
        return new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true 
        });
    }

    // Clear modal inputs
    function clearModalInputs() {
        categorySelect.value = '';
        ingredientSelect.value = '';
        stockInput.value = '';
        remainingInput.value = '';
        ingredientSelect.innerHTML = '<option value="">--Select Ingredient--</option>';
        ingredientSelect.disabled = true;
    }

 

    // Show remaining stock based on selected ingredient
    ingredientSelect.addEventListener('change', function () {
        const selectedCategory = categorySelect.value;
        const selectedIngredient = ingredientSelect.value;

        if (currentStockData[selectedCategory] && currentStockData[selectedCategory][selectedIngredient]) {
            remainingInput.value = currentStockData[selectedCategory][selectedIngredient];
        } else {
            remainingInput.value = 0; // Default to 0 if no data found
        }
    });

    // Select all checkboxes event listener
    selectAllCheckbox.addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('.select-row');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });

    // Open the modal to add data
    document.getElementById('addButton').addEventListener('click', function () {
        modal.style.display = 'flex';
        dateTimeDisplay.textContent = getCurrentDateTime();
        console.log(dateTimeDisplay);
    
        clearModalInputs();
    
        // Set the remaining value to the correct initial value
        remainingInput.value = stockInput.value || 0;
    });


    // Close modal when clicking outside of it
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            clearModalInputs();
        }
    });

    // Handle the delete button logic
    deleteButton.addEventListener('click', function () {
        const selectedRows = inventoryTable.querySelectorAll('.select-row:checked');
    
        if (selectedRows.length === 0) {
            alert('Please select at least one row to delete.');
            return;
        }
        deleteModal.style.display = 'block';
    });

    closeDeleteModal.addEventListener('click', function () {
        deleteModal.style.display = 'none';
    });

    cancelDeleteButton.addEventListener('click', function () {
        deleteModal.style.display = 'none';
    });

    confirmDeleteButton.addEventListener('click', function () {
        const pin = pinInput.value; // Get the entered PIN
        
        

        // Verify the PIN (replace with your actual PIN verification logic)
        if (pin === '1234') { // Example PIN for demonstration purposes
            // Find all selected rows
            const selectedRows = inventoryTable.querySelectorAll('.select-row:checked');
            
            // Loop through each selected checkbox and remove the corresponding row
            selectedRows.forEach(checkbox => {
                const row = checkbox.closest('tr'); // Get the closest row to the checkbox
                const ingredient = row.cells[1].textContent;
                const category = row.cells[2].textContent;
    
                // Update the current stock data to set remaining to 0 for the deleted ingredient
                if (currentStockData[category] && currentStockData[category][ingredient]) {
                    currentStockData[category][ingredient] = 0;
                }
    
                row.remove(); // Remove the row from the table
            });
    
            // Perform the delete operation in the database (ensure the ingredient and category are passed)
            selectedRows.forEach(checkbox => {
                const row = checkbox.closest('tr');
                const ingredient = row.cells[1].textContent;
                const category = row.cells[2].textContent;
        
                // Call the delete function for each row
                deleteFromDatabase(ingredient, category);
            });
    
            // Close the modal after deletion
            deleteModal.style.display = 'none';
            alert('Item deleted successfully!');
        } else {
            alert('Incorrect PIN. Deletion aborted.');
        }
    
        // Clear the PIN input field
        pinInput.value = '';
    });
    
    
  

    // Delete data from SQLite database
    function deleteFromDatabase(ingredient, category) {
        return fetch('http://127.0.0.1:3000/api/inventory', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredient, category })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting from database');
            }
        })
        .catch(error => {
            console.error('An error occurred:', error);
            alert('An error occurred while deleting the item. Please try again.');
        });
    }
    

    // Close modal and clear inputs when clicking the close button
    closeButton.addEventListener('click', function () {
        modal.style.display = 'none';
        clearModalInputs();
    });

    // Populate category select on load
    populateCategorySelect();
    dateTimeDisplay.textContent = getCurrentDateTime();

    fetch('http://127.0.0.1:3000/api/inventory')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Convert the response to JSON
    })
    .then(data => {
        if (data && Array.isArray(data)) {
            populateInventoryTable(data); // Only call populateInventoryTable if data is a valid array
        } else {
            console.error('Fetched data is not an array or is undefined');
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

    
    // Populate table with fetched data
    function populateInventoryTable(data) {
        const tbody = document.querySelector('#inventory_tracking tbody');
        tbody.innerHTML = ''; // Clear any existing rows
    
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.date}</td>
                <td>${item.time}</td>
                <td>${item.ingredient}</td>
                <td>${item.category}</td>
                <td>${item.stock}</td>
                <td>${item.remaining}</td>
                <td><input type="checkbox" class="select-row"></td>
            `;
            tbody.appendChild(row);
        });
    }

    
});

function filterTable() {
    const input = document.getElementById('searchBar').value.toLowerCase();
    const rows = document.querySelectorAll('#inventory_tracking tbody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const match = Array.from(cells).some(cell => 
            cell.textContent.toLowerCase().includes(input)
        );
        row.style.display = match ? '' : 'none';
    });
}




