window.onload = function() {
  initialize()
};

function initialize() {
  // add event listeners
  document.getElementById('filter-details-close').addEventListener('click', closeDetails);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // populate filters
  populateFilters();

  // populate filter list
  for (let i = 0; i < dataset.length; i++) {
    populateGrid(i)
  }

  // update display count
  if (document.querySelectorAll("#filter-list > div > figure").length == 0) {
    document.getElementById("display-count").innerHTML = "No results found. <a onclick='resetFilter()'>Clear filters</a>."
  }
  else {
    document.getElementById("display-count").innerHTML = "Displaying " + document.querySelectorAll("#filter-list > div > figure").length + " of " + dataset.length + " filters";
  }

  // check cookies and apply preferences
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  const theme = getCookie('theme');
  if (theme == 'theme-dark') {
    document.querySelector('body').classList = 'theme-dark';
    document.querySelector('#theme-toggle').innerHTML = 'light_mode';
  }

  // get current url with parameters
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // add search query to search input
  const urlSearch = urlParams.get('q')
  document.getElementById('input-search').value = urlSearch;

  // if brand parameter is valid, set brand input
  const urlBrand = urlParams.get('b')
  if (urlBrand) {
    for (let i = 0; i < document.getElementById('input-brand').length; i++) {
      if (urlBrand == document.getElementById('input-brand').options[i].value) {
        document.getElementById('input-brand').value = urlBrand;
      }
    }
  }

  // if type parameter is valid, set type input
  const urlType = urlParams.get('t')
  if (urlType) {
    for (let i = 0; i < document.getElementById('input-type').length; i++) {
      if (urlType == document.getElementById('input-type').options[i].value) {
        document.getElementById('input-type').value = urlType;
      }
    }
  }

  // run applyFilter function
  applyFilter();

  // if filter id is valid, run populateDetails function
  const urlId = urlParams.get('id')
  for (let i = 0; i < dataset.length; i++) {
    if (dataset[i].id == urlId) {
      populateDetails(i);
    }
  }

  // slider function
  updateSliders();
}

// functions
function updateSliders() {
  const slidersAll = document.querySelectorAll("figure input");
  for (const slider of slidersAll) {
    slider.oninput = (event) => {
      // event.target refers to the input element that was changed
      const id = event.target.getAttribute("data-controls");
      const img = document.getElementById(id);
      newPosition = 100 - slider.value + "%";
      img.style.setProperty('--slider-position', newPosition);
    }
  }
}

function populateFilters() {
    // create array of all unique brands from the database
    brandArray = [];
    for (let i = 0; i < dataset.length; i++) {
        if(brandArray.indexOf(dataset[i].brand) === -1) {
            brandArray.push(dataset[i].brand);
        }
    }
    brandArray = brandArray.sort(); // sort the array alphabetically

    // populate DOM with brands
    for (let i = 0; i < brandArray.length; i++) {
        const input = document.getElementById('input-brand');
        const option = document.createElement('option');
        option.value = brandArray[i];
        option.innerHTML = brandArray[i];
        input.appendChild(option);
    }
}

function populateGrid(i) {
  const content = document.querySelector('#filter-list > div');
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  const figcaption = document.createElement('figcaption');
  const div = document.createElement('div');
  content.appendChild(figure);
  figure.id = dataset[i].id;
  figure.onclick = function(){populateDetails(i)};
  figure.appendChild(img);
  img.src = "images/" + dataset[i].id + "/00.png";
  figure.appendChild(figcaption);
  figcaption.innerHTML = `<p>${dataset[i].brand}</p>\n<p>${dataset[i].model}</p>`;
}

function populateDetails(i) {
  //scroll details to top of page
  document.getElementById('filter-details').scrollTo(0,0);

  //hide default message and show details
  document.querySelector('#filter-details-message').classList = 'hidden';
  document.querySelector('#filter-details-container').classList = '';
  
  //clear detail information
  const images = document.querySelectorAll('#filter-images figure');
  images.forEach(images => {
    images.remove();
  });
  const rows = document.querySelectorAll('#filter-links tr');
  rows.forEach(rows => {
    rows.remove();
  });

  //load new detail information
  document.getElementById('filter-info-brand').innerHTML = dataset[i].brand;
  document.getElementById('filter-info-model').innerHTML = dataset[i].model;
  document.getElementById('filter-info-type').innerHTML = dataset[i].type;
  document.getElementById('filter-info-exp').innerHTML = dataset[i].exp;
  document.getElementById('filter-info-temp').innerHTML = dataset[i].temp;
  document.getElementById('filter-info-tint').innerHTML = dataset[i].tint;
  const target = document.getElementById('filter-images');
  for (let j = 0; j < dataset[i].images.length; j++) {
    target.innerHTML += `
      <figure>
        <div class="filter-images">
          <div style="background-image: url('images/${dataset[i].id}/${dataset[i].images[j].compPhoto}')">
            <span>${dataset[i].images[j].compName}</span>
          </div>
          <div id="${dataset[i].id}-${j}" style="background-image: url('images/${dataset[i].id}/${dataset[i].images[j].photo}')">
            <span>${dataset[i].brand} ${dataset[i].model}</span>	
          </div>
          <input data-controls="${dataset[i].id}-${j}" type="range" min="0" max="100" value="50" step="0.1">
        </div>
        <figcaption>
          <div>
            <span class="camera">${dataset[i].images[j].camera}</span>
            <span class="lens">${dataset[i].images[j].lens}</span>
          </div>
          <div>
            <span class="setting-1">${dataset[i].images[j].setting}</span>
            <span class="setting-2">${dataset[i].images[j].value}</span>
          </div>
        </figcaption>
      </figure>
    `
  }
  if (Object.keys(dataset[i].links).length > 0) {
    document.getElementById('filter-info-buy').innerHTML = '';
    for (let j = 0; j < Object.keys(dataset[i].links).length; j++) {
      document.getElementById('filter-info-buy').innerHTML += `<a href="${Object.values(dataset[i].links)[j]}">${Object.keys(dataset[i].links)[j]}</a>`;
      if (j < Object.keys(dataset[i].links).length - 1) {
          document.getElementById('filter-info-buy').innerHTML += `, `
      }
    }    
  }
  else {
    document.getElementById('filter-info-buy').innerHTML = 'N/A';
  }
  document.getElementById('filter-details').classList = 'open';
  document.title = 'Filter Database - ' + dataset[i].brand + " " + dataset[i].model;

  //update sliders
  updateSliders();

  //update browser url/history
  var queryString = new URL(document.location);
  queryString.searchParams.set('id', dataset[i].id);
  window.history.pushState(null, '', queryString);
}

function loadDetails(id) {
  for (let i = 0; i < dataset.length; i++) {
    if (dataset[i].id == id) {
      populateDetails(i);
    }
  }
  document.getElementById('filter-details').scrollTo(0,0);
}

function closeDetails() {
  //remove class to hide modal
  document.getElementById('filter-details').classList = '';

  //document.querySelector('#filter-details-message').classList = '';
  //document.querySelector('#filter-details-container').classList = 'hidden';

  //update browser url/history
  document.title = 'filter Database';
  var queryString = new URL(document.location);
  queryString.searchParams.delete('id');
  window.history.pushState(null, '', queryString);
}

function toggleTheme() {
  if(document.querySelector('body').classList.contains('theme-light')) {
    document.querySelector('body').classList = 'theme-dark';
    document.getElementById('theme-toggle').innerHTML = 'light_mode';
    document.cookie = 'theme=theme-dark';
  }
  else {
    document.querySelector('body').classList = 'theme-light';
    document.getElementById('theme-toggle').innerHTML = 'dark_mode';
    document.cookie = 'theme=theme-light';
  }
}

function applyFilter() {
  //create array
  filterIndexes = []
  
  //set filter params
  filterSearch = document.getElementById('input-search').value;
  filterBrand = document.getElementById('input-brand').value;
  filterType = document.getElementById('input-type').value;
    
  //check dataset for matches
  for (let i = 0; i < dataset.length; i++) {
    matchSearch = false;
    matchBrand = true;
    matchType = true;
    
    //matchSearch 
    if (!filterSearch) {
      matchSearch = true;
    }
    else {
      filterName = dataset[i].brand + " " + dataset[i].model;
      if (filterName.toUpperCase().includes(filterSearch.toUpperCase())) {matchSearch = true;}
    }
    
    //matchBrand
    if (filterBrand && dataset[i].brand != filterBrand) {
      matchBrand = false;
    }
    
    //matchType
    if (filterType && dataset[i].type != filterType) {
      matchType = false;
    }
        
    //add matches to index list
    if (matchSearch && matchBrand && matchType) {
      filterIndexes.push(i);
    }
  }
  
  //clear filter list
  document.querySelector('#filter-list > div').innerHTML = '';
  
  //populate filter list
  for (let j = 0; j < filterIndexes.length; j++) {
    populateGrid(filterIndexes[j])
  }

  // update display count
  if (document.querySelectorAll("#filter-list > div > figure").length == 0) {
    document.getElementById("display-count").innerHTML = "No results found. <a onclick='resetFilter()'>Clear filters</a>."
  }
  else {
    document.getElementById("display-count").innerHTML = "Displaying " + document.querySelectorAll("#filter-list > div > figure").length + " of " + dataset.length + " filters";
  }

  //update browser url/history
  var queryString = new URL(document.location);
  if (filterSearch){queryString.searchParams.set('q', filterSearch)};
  if (filterBrand){queryString.searchParams.set('b', filterBrand)};
  if (filterType){queryString.searchParams.set('t', filterType)};
  window.history.pushState(null, '', queryString);
}

function resetFilter() {
  //clear filter list
  document.querySelector('#filter-list > div').innerHTML = '';
  
  //populate filter list
  for (let i = 0; i < dataset.length; i++) {
    populateGrid(i)
  }

  // update display count
  if (document.querySelectorAll("#filter-list > div > figure").length == 0) {
    document.getElementById("display-count").innerHTML = "No results found. <a onclick='resetFilter()'>Clear filters</a>."
  }
  else {
    document.getElementById("display-count").innerHTML = "Displaying " + document.querySelectorAll("#filter-list > div > figure").length + " of " + dataset.length + " filters";
  }
  
  //reset inputs
  document.getElementById('filters-form').reset()

  //reset url params
  var queryString = new URL(document.location);
  queryString.searchParams.delete('q');
  queryString.searchParams.delete('b');
  queryString.searchParams.delete('t');
  window.history.pushState(null, '', queryString);
}