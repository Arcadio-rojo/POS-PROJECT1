let transactionData = [];

async function fetchTransactions() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        transactionData = data.products;
        displayTransactions(transactionData);
        updateTotals(transactionData);
    } catch (error) {
        console.log('Server connection status: Checking server...');
        setTimeout(fetchTransactions, 3000);
    }
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionBody');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.product_name}</td>
            <td>${transaction.category}</td>
            <td>${transaction.total_item}</td>
            <td>₱${transaction.total_amount.toFixed(2)}</td>
            <td>${transaction.date}</td>
        `;
        tbody.appendChild(row);
    });
    
    updateTotals(transactions);
}

function updateTotals(transactions) {
    const totalItems = transactions.reduce((sum, transaction) => sum + transaction.total_item, 0);
    const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.total_amount, 0);
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
}

function sortTransactions() {
    const sortValue = document.getElementById('sortFilter').value;
    const sortedData = [...transactionData];
    
    if (sortValue === 'high') {
        sortedData.sort((a, b) => b.total_amount - a.total_amount);
    } else if (sortValue === 'low') {
        sortedData.sort((a, b) => a.total_amount - b.total_amount);
    }
    
    displayTransactions(sortedData);
}

function filterByDate() {
    const selectedDate = document.getElementById('dateSearch').value;
    const filteredData = transactionData.filter(transaction => 
        transaction.date.includes(selectedDate)
    );
    displayTransactions(filteredData);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchTransactions);