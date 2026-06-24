// Function to display the relevant inventory table based on the user's selection
function displayTable() {
    var selectedValue = document.getElementById("format").value;
    console.log('Selected Value:', selectedValue); // Log selected value

    // Hide both tables initially
    document.getElementById("stocksTable").style.display = "none";
    document.getElementById("productsTable").style.display = "none";

    // Show the relevant table based on the selected value
    if (selectedValue === "stocks") {
        document.getElementById("stocksTable").style.display = "block";
        fetchStocks(); // Fetch stock data
    } else if (selectedValue === "products") {
        document.getElementById("productsTable").style.display = "block";
        console.log('Fetching Products...'); // Log fetch action
        fetchProducts(); // Fetch product data
    }
}


setInterval(() => {
    if (document.getElementById("stocksTable").style.display === "block") {
        fetchStocks();
    }
}, 30000);

// Function to fetch and display products data
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Enable CORS if needed
                'Access-Control-Allow-Origin': '*'
            }
        });
        
        const data = await response.json();
        displayProductsData(data.products);
    } catch (error) {
        console.log('Server connection status: Checking server...');
        // Retry mechanism
        setTimeout(fetchProducts, 3000);
    }
}

function displayProductsData(products) {
    const productsBody = document.getElementById('productsBody');
    productsBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.product_name}</td>
            <td>${product.category}</td>
            <td>${product.total_item}</td>
            <td>₱${product.total_amount.toFixed(2)}</td>
            <td>${product.date}</td>
        `;
        productsBody.appendChild(row);
    });
}

function filterTable() {
    const searchInput = document.getElementById("searchBar");
    const filter = searchInput.value.toUpperCase();
    let table, tbody, tr;

    // Determine which table is currently visible
    if (document.getElementById("stocksTable").style.display === "block") {
        tbody = document.getElementById("stocksBody");
    } else if (document.getElementById("productsTable").style.display === "block") {
        tbody = document.getElementById("productsBody");
    }

    if (tbody) {
        tr = tbody.getElementsByTagName("tr");

        // Loop through all table rows
        for (let i = 0; i < tr.length; i++) {
            const td = tr[i].getElementsByTagName("td");
            let found = false;

            // Loop through all cells in the row
            for (let j = 0; j < td.length; j++) {
                const cellText = td[j].textContent || td[j].innerText;
                if (cellText.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
            tr[i].style.display = found ? "" : "none";
        }
    }
}



async function fetchStocks() {
    try {
        const response = await fetch('http://localhost:3000/api/stocks', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
        const data = await response.json();
        displayStocksData(data.stocks);
    } catch (error) {
        console.log('Server connection status: Checking server...');
        setTimeout(fetchStocks, 3000);
    }
}

function displayStocksData(stocks) {
    const stocksBody = document.getElementById('stocksBody');
    stocksBody.innerHTML = '';
    
    stocks.forEach(stock => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stock.ingredient}</td>
            <td>${stock.category}</td>
            <td>${stock.stock}</td>
            <td>${stock.remaining}</td>
            <td>${stock.date}</td>
        `;
        stocksBody.appendChild(row);
    });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayTable();
});

