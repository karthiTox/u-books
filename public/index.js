console.log("attached");

let searchText = "";
let searchAuthor = "";
let searchCategory = "";
let currentIndex = 0;
const pageSize = 20;

function buildSearchQuery() {
  let result = "";
  result += "q=" + removeEmptySpaces(searchText);
  if (searchAuthor != "")
    result += "+inauthor:" + removeEmptySpaces(searchAuthor);
  if (searchCategory != "")
    result += "+subject:" + removeEmptySpaces(searchCategory);
  result += "&";
  result += "startIndex=" + currentIndex * pageSize;
  result += "&";
  result += "maxResults=" + pageSize;
  return result;
}


$(window).scroll(function () {
  if ($(window).scrollTop() >= $(document).height() - $(window).height() - 100) {
    if(isFetchingBook == false) {
      console.log("started fetching");
      addBookCard();
    }
  }
});

$("#search-btn").click(()=>{
  searchText = $("#search-input").val();
  searchAuthor = "";
  searchCategory = "";
  currentIndex = 0;
  if(searchText == "") return;
  renderBookList();
  console.log("clicked!")  
});

async function onSelectAuthor(author) {
  searchAuthor = author;
  currentIndex = 0;
  renderBookList();
}

async function onSelectCategory(category) {
  searchCategory = category;
  currentIndex = 0;
  renderBookList();
}

async function onUnSelectAuthor() {
  searchAuthor = "";
  currentIndex = 0;
  renderBookList();
}

async function onUnSelectCategory() {
  searchCategory = "";
  currentIndex = 0;
  renderBookList();
}

async function onUnSelectSearchText() {
  searchText = "";
  currentIndex = 0;
  renderBookList();
}

async function renderBookList() {
  $("#welcome-text").text("Loading..");
  const response = await getBooksList();
  setContent(response);
  setSideBar(response);
  $("#welcome-msg").remove();
}

async function getBooksList() {
  const query = buildSearchQuery();
  console.log(query);
  let response = await fetch("/books?" + query);
  response = await response.json();
  console.log(response);
  return response;
}

async function setSideBar(response) {
  if(response.totalItems <= 0) return;
  // seperating authors
  let authors = [];
  response.items.forEach((item) => {
    let fetchedAuthors = item.volumeInfo.authors;
    if (fetchedAuthors != undefined) {
      fetchedAuthors.forEach((author) => {
        if (!authors.includes(author)) authors.push(author);
      });
    }
  });

  // seperating catogories
  let categories = [];
  response.items.forEach((item) => {
    let fetchedCategories = item.volumeInfo.categories;
    if (fetchedCategories != undefined) {
      fetchedCategories.forEach((category) => {
        if (!categories.includes(category)) categories.push(category);
      });
    }
  });

  let filterContent = "";

  filterContent += '<div class="row mt-2"><h6>Filters</h6></div>';
  filterContent += '<div class="row list-group list-group-light p-2">';
  filterContent +=
    '<a href="#" class="list-group-item list-group-item-action active" aria-current="true">Authors</a>';
  for (let i = 0; i < authors.length; i++) {
    filterContent += `<a href="#" class="list-group-item list-group-item-action" onclick="onSelectAuthor('${authors[i]}')">${authors[i]}</a>`;
  }

  filterContent +=
    '<a href="#" class="list-group-item list-group-item-action px-3 border-0"></a>';
  filterContent +=
    '<a href="#" class="list-group-item list-group-item-action active" aria-current="true">Categories</a>';
  for (let i = 0; i < categories.length; i++) {
    filterContent += `<a href="#" class="list-group-item list-group-item-action" onclick="onSelectCategory('${categories[i]}')">${categories[i]}</a>`;
  }
  filterContent += "</div>";

  $("#side-bar").html(filterContent);
}

async function setContent(response) {
  let content = "";

  content += `<div class='row mt-2 ml-2'><h5>${response.totalItems} Items found</h5></div>`;

  // if(searchText != "" || searchAuthor != "" || searchCategory != "") content += `<div class='row mt-2 ml-2'><p>applied filters</p></div>`;  
  
  content += `<div id="filters-list" class='row ml-2'>`;  
  if(searchText != "") content += `<button class="col-2 col-sm-3 m-2 btn btn-primary" href="#" role="button">${searchText}  <i class='fa fa-search'></i></button>`;
  if(searchAuthor != "") content += `<button class="col-3 col-lg-2 m-2 btn btn-primary" href="#" role="button" onclick="onUnSelectAuthor()">${searchAuthor} <i class='fa fa-close'></i></button>`;
  if(searchCategory != "") content += `<button class="col-3 col-lg-2 m-2 btn btn-primary" href="#" role="button" onclick="onUnSelectCategory()">${searchCategory} <i class='fa fa-close'></i></button>`;
  content += `</div>`;

  if (response.totalItems > 0) {
    content += "<div id='books-list' class='row mt-2 ml-2'>";

    for (let i = 0; i < response.items.length; i++) {
      content += createBookCard(response.items[i]);
    }

    content += "</div>";
  }

  $("#content").html(content);
}

let isFetchingBook = false;

async function addBookCard() {
  isFetchingBook = true;
  $("#books-list").append(`<div id="loading" class="col-lg-3 col-md-6 col-sm-6 p-2 align-middle">Loading...</div>`);

  currentIndex++;
  const response = await getBooksList();

  $("#loading").remove();
  isFetchingBook = false;

  if (response.totalItems > 0 && ("items" in response)) {
    for (let i = 0; i < response.items.length; i++) {
      $("#books-list").append(createBookCard(response.items[i]));
    }
  }
}

function createBookCard(info) {
  if (!("volumeInfo" in info) || !("imageLinks" in info.volumeInfo)) return ``;
  if (
    !("title" in info.volumeInfo) ||
    !("imageLinks" in info.volumeInfo) ||
    !("authors" in info.volumeInfo) ||
    !("categories" in info.volumeInfo) ||
    !("publishedDate" in info.volumeInfo) ||
    !("previewLink" in info.volumeInfo)
  )
    return ``;
  if (!("thumbnail" in info.volumeInfo.imageLinks)) return ``;

  return `
  <div class="col-lg-3 col-md-6 col-sm-6 p-2">
    <div class="card">
      <img class="card-img-top"
        src="${info.volumeInfo.imageLinks.thumbnail}"
        alt="Card image cap">
        <div class="card-body">
                <h5 class="card-title">${info.volumeInfo.title}</h5>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">Author: ${info.volumeInfo.authors}</li>                
                <li class="list-group-item">Subject: ${info.volumeInfo.categories}</li>                
                <li class="list-group-item">Published at: ${info.volumeInfo.publishedDate}</li>                
              </ul>
              <div class="card-body">
                <a href="${info.volumeInfo.previewLink}" class="btn btn-primary">view</a>
              </div>
            </div>
          </div>`;
}

function removeEmptySpaces(searchText) {
  return searchText.split(" ").join("%20");
}
