const qualityApp = {};

//Target the city dropdownElement's value
qualityApp.dropdownElement = document.querySelector('#cities');
console.log(qualityApp.dropdownElement);

//Target the form
qualityApp.formElement = document.querySelector('form');
console.log(qualityApp.formElement);

//Getter method for selected continent
qualityApp.getContinent = () => document.querySelector('input[type=radio]:checked').value;

//Event listener for continent radio buttons to update the city list
qualityApp.continentListener = () => {
    const radioElements = document.querySelectorAll('input[type=radio]');
    
    radioElements.forEach((radioElement) => {
        radioElement.addEventListener('change', function () {
            //Create the dropdown list of cities for the selected continent
            if (radioElement.checked) {
                const selectedContinent = radioElement.value;
                qualityApp.createDropdown(selectedContinent);
            }
        })

    })
}

// Populate the dropdown list with cities in the selected continent
qualityApp.createDropdown = (continent) => {
    const url = new URL(`https://api.teleport.org/api/continents/geonames:${continent}/urban_areas/`);

    fetch(url)
    .then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    })
    .then(function (cityListResult) {
        const cityListArray = cityListResult._links["ua:items"];
        qualityApp.populateDropdown(cityListArray);
    })
    .catch(function (error) {
        alert(error.message);
    })
}

// Appends options to the dropdown
qualityApp.populateDropdown = (cityListArray) => {
    // Clear the city list
    qualityApp.dropdownElement.innerHTML = '<option value selected disabled>Select an option</option>';

    // Populate the city list
    cityListArray.forEach(function (city) {
        const cityOption = document.createElement('option');
        cityOption.value = city.href;
        cityOption.textContent = city.name;
        qualityApp.dropdownElement.append(cityOption);
    })
}

// Getter Methods for the City
qualityApp.getCityName = () => qualityApp.dropdownElement.selectedOptions[0].innerText;
qualityApp.getCityHref = () => qualityApp.dropdownElement.value;

// Get the user's city selection
qualityApp.displayCity = () => {
    // Listen for city change
    qualityApp.formElement.addEventListener('change', function(e) {
        e.preventDefault();

        // Store the selected city name and API url
        const selectedCityName = qualityApp.getCityName();
        const selectedCityHref = qualityApp.getCityHref();

        // Make an API call to get to the required endpoints
        const imagesUrl = new URL(`${selectedCityHref}images/`);
        const scoresUrl = new URL(`${selectedCityHref}scores/`);

        // Connect to image endpoint and display image
        fetch(imagesUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(function (imageData) {
            const cityImageObject = imageData.photos[0];
            console.log(cityImageObject);
            qualityApp.displayImage(selectedCityName, cityImageObject);
        })
        .catch(function (error) {
            alert(error.message);
        })

        // Connect to scores endpoint and display scores
        fetch(scoresUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then(function (cityData) {
            console.log(cityData);
            const cityScoresArray = cityData.categories;
            const cityDescription = cityData.summary;
            const cityAPIScore = cityData.teleport_city_score;
            qualityApp.displaySummary(cityAPIScore, cityDescription);
            qualityApp.displayScores(selectedCityName, cityScoresArray);
            //city category checkbox
            qualityApp.toggleScoreVisibility();
        })
        .catch(function(error) {
            alert(error.message);
        })

    })
    
}

qualityApp.displayImage = (cityName, cityImage) => {
    const cityImageElement = document.querySelector('#cityImage');
    cityImageElement.src = ``;
    cityImageElement.alt = ``;

    cityImageElement.src = `${cityImage.image.web}`;
    cityImageElement.alt = `Photograph of ${cityName}`;

    console.log(cityImageElement);
}

qualityApp.displaySummary = (cityAPIScore, citySummary) => {
    const cityAPIScoreElement = document.querySelector('#cityAPIScore');
    const citySummaryElement = document.querySelector('#citySummary');

    cityAPIScoreElement.textContent = `Overall Score: ${cityAPIScore.toFixed(1)} / 100`;

    // This is used to strip extra <p> and <b> tags in the citySummary from the API
    citySummaryElement.innerHTML = citySummary;
    citySummaryElement.innerHTML = citySummaryElement.textContent;
}

qualityApp.displayScores = (cityName, cityScores) => {

    //Display category checkbox list
    const categoryContainerElement = document.querySelector('.categoryContainer');
    categoryContainerElement.classList.remove('hidden');
    
    // Display city name
    const cityNameElement = document.querySelector('#cityName');
    cityNameElement.innerText = cityName;
    
    // Clear the list first
    const cityScoresElement = document.querySelector('#cityScores');
    cityScoresElement.innerHTML = '';

    // Create and append the score list items
    cityScores.forEach(function (category, index) {
        const listElement = document.createElement('li');
        const checkboxElement = document.querySelector(`input[value="${index}"]`);
        
        //if the checkbox category is not checked on load, hide the list item
        if (!checkboxElement.checked) {
            listElement.classList.add('hidden');
        }

        listElement.innerHTML = `<h4>${category.name}: </h4><p class="score">${category.score_out_of_10.toFixed(1)}/10</p>`;

        cityScoresElement.append(listElement);
    })
}

qualityApp.toggleScoreVisibility = () => {
    // target the checkbox elements
    const checkboxElements = document.querySelectorAll('input[type=checkbox]');
    // target the li elements
    const listElements = document.querySelectorAll('li');

    // target the span showing number of hidden scores
    const hiddenScoreCounterElement = document.querySelector('#hiddenScoreCount')

    // Count and display count of hidden scores
    let hiddenScoreCounter = 0;
    for (let i = 0; i < checkboxElements.length; i++) {
        if (!checkboxElements[i].checked) {
            hiddenScoreCounter++;
        }
    }
    hiddenScoreCounterElement.textContent = `(${hiddenScoreCounter} scores hidden)`;

    // Hide and show scores and update hidden score counter
    checkboxElements.forEach((checkboxElement, index) => {
        checkboxElement.addEventListener('change', function() {
            //if it's checked, we show the category
            if (checkboxElement.checked) {
                listElements[index].classList.remove('hidden');
                hiddenScoreCounter--;
            //if it's not checked we hide the category
            } else {
                listElements[index].classList.add('hidden');
                hiddenScoreCounter++;
            }
            hiddenScoreCounterElement.textContent = `(${hiddenScoreCounter} scores hidden)`;
        })
    })

}

qualityApp.init = () => {
    qualityApp.continentListener();
    qualityApp.createDropdown(qualityApp.getContinent());
    qualityApp.displayCity();
}

qualityApp.init();