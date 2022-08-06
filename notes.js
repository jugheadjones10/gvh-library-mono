// Am trying to figure out how the Google sheet workflow works again. 
// First, books are chosen to be displayed on the frontend solely by checking whether inventory value is 1, and whether title and
// index number exists or not. 
// When the user submits a book borrow request, all books from the whole Booklist google sheet is fetched into memory. Then, in a
// highly inefficient manner, we loop through every book submission and find the corresponding row from the Booklist google sheet.
// Then the inventory value is switched from 1 to 0, and the row of books requested is appended as the last row to the submissions
// tracking google sheet. 
