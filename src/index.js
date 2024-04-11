// Base URL for the API
const URL = 'http://localhost:3000';
// Reference to the movie list element
const movieList = document.getElementById('films');

// When the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Remove the first movie item from the list
  document.querySelector('.film.item').remove();
  // Fetch movie details and movies from the server
  fetchMovieDetails(URL);
  fetchMovies(URL);
});

// Function to fetch details of a specific movie
function fetchMovieDetails(url) {
    fetch(`${url}/films/1`)
      .then((response) => response.json())
      .then((data) => {
         // Set up details of the retrieved movie
         setUpMovieDetails(data);
      });
}

// Function to fetch all movies from the server
function fetchMovies(url) {
    fetch(`${url}/films`)
      .then((resp) => resp.json())
      .then((movies) => {
        // For each movie, display it
        movies.forEach((movie) => {
           displayMovie(movie);
        });
      });
}

// Function to display a single movie
function displayMovie(movie) {
    // Create a list item element
    const list = document.createElement('li');
    list.classList.add('film', 'item'); 
    list.style.cursor = 'pointer';
    list.textContent = movie.title;
    list.dataset.id  = movie.id;

    // Create a delete button for the movie
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    list.appendChild(deleteButton);

    // Append the movie item to the movie list
    movieList.appendChild(list);

    // Add event listener for delete button
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const confirmDelete = confirm('Are you sure you want to delete this movie?');
      if(confirmDelete){
        deleteFilm(movie.id);
      }
    });

    // Check if movie is sold out and update the list item accordingly
    if (movie.tickets_sold >= movie.capacity) {
      list.classList.add('sold', 'out');
    }
}

// Function to set up details of a specific movie
function setUpMovieDetails(movie) {
  const preview = document.getElementById('poster');
  preview.src = movie.poster;

  const movieTitle = document.querySelector('#title');
  movieTitle.textContent= movie.title;

  const movieTime = document.querySelector(`#runtime`);
  // Set movie runtime in minutes
  movieTime.textContent = `${movie.runtime} minutes`;}

  const movieDescription = document.querySelector(`#film-info`);
  movieDescription.textContent = movie.description;

  const showTime = document.querySelector(`#showtime`);
  showTime.textContent = movie.showtime;

  const remainingTickets = document.querySelector('#ticket-num');
  // Calculate and display remaining tickets
  remainingTickets.textContent = movie.capacity - movie.tickets_sold;

  const buyTicketButton = document.getElementById('buy-ticket');
  buyTicketButton.addEventListener('click', (event) => {
    event.preventDefault();
    // Check if tickets are available
    if (parseInt(remainingTickets.textContent, 10) > 0){
      // Decrease remaining tickets count
      remainingTickets.textContent = parseInt(remainingTickets.textContent, 10) - 1;
      // Update tickets sold on the server
      fetch(`${URL}/films/${movie.id}`, {
        method: 'PATCH',
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickets_sold: movie.tickets_sold + 1,
        }),
      });
      // Record ticket purchase
      fetch(`${URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',  
        },
        body: JSON.stringify({
          film_id: movie.id,
          number_of_tickets: 1,
        }),
      });
    } else {
      buyTicketButton.textContent = 'Sold Out';
    }
  });


// Functionality to delete a movie (Bonus)
function deleteFilm(id) {
  fetch (`${URL}/films/${id}`, {
    method: 'DELETE',
  })
    .then(() => {
      // Remove the movie from the DOM
      const filmItem = document.querySelector(`#films li[data-id="${id}"]`);
      filmItem.remove();
    })
    .catch((error) => console.error('Error deleting film:',error));
}