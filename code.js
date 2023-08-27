var map = L.map('map').setView([36.427392, 10.681001], 8);
const geoapiKey = "AAPK1cb96369d4d04b58b73cd33d6f834f79P81o0lasbBR71FmXUxl-vYKw4uBq4cEfvte0AahdWexrfAAe0Kq2beqT-1fWstSt";
const basemapEnum = "ArcGIS:Navigation";
L.esri.Vector.vectorBasemapLayer(basemapEnum, {
  apiKey: geoapiKey
}).addTo(map) 

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define a custom icon with a different color




var blackIcon = createCustomIcon('markers/black.png');
var violetIcon = createCustomIcon('markers/violet.png');
var greenIcon = createCustomIcon('markers/green.png');
var redIcon = createCustomIcon('markers/red.png');
var homeIcon = createCustomIcon('markers/home.png');
var pinkIcon = createCustomIcon('markers/pink.png');
var yellowIcon = createCustomIcon('markers/yellow.png');
const filterTextFields = [];
//combobox handler
const container = document.getElementById('container');

let comboBoxCounter = 0; // Counter to keep track of combo boxes and text fields

function handleSelection(event) {
  if (comboBoxCounter < 1) { // Limit to 2 combo boxes and text fields
    const selectedValue = event.target.value;

    if (selectedValue) {
      const comboBoxWrapper = event.target.parentNode;
      comboBoxWrapper.classList.add('selected');

      const nextComboBoxWrapper = document.createElement('div');
      nextComboBoxWrapper.classList.add('combo-box-wrapper');
      container.appendChild(nextComboBoxWrapper);

      const nextComboBox = document.createElement('select');
      nextComboBox.classList.add('combo-box');
      nextComboBox.addEventListener('change', handleSelection);
      nextComboBoxWrapper.appendChild(nextComboBox);

      const textField = document.createElement('input');
      textField.type = 'text';
      textField.classList.add('text-field');
      textField.placeholder = "utiliser < , > , = ";
      nextComboBoxWrapper.appendChild(textField); // Append the text field to the combo box wrapper

      const options = Array.from(event.target.options);
      options.forEach(option => {
        if (option.value !== selectedValue) {
          const newOption = document.createElement('option');
          newOption.value = option.value;
          newOption.text = option.text;
          nextComboBox.appendChild(newOption);
        }
      });

      comboBoxCounter++; // Increment the counter
    }
  }
}



    const comboBox = document.querySelector('.combo-box');
    comboBox.addEventListener('change', handleSelection);


let names=[];

// Define the geocode function
function retrieveAgencies(data) {
  const objects = []; // Array to store the objects
  
  // Iterate over each row in the data
  data.forEach((row) => {
    // Create an object with the desired variables
    const obj = {
      adresse: row.Adresse + " Tunisie",
      agency: row.Agence,
      code: row["CC TBeds"],
      potential: row["Pot"],
      pays: row["Pays"],
      numTel: row["N° Tel"],
      site_fb: row["siteFB"],
      email: row.eMail + " / " + row.eMail2,
      responsable: row["Res"],
      nbFollower: row["Nb Followers FN (K)"],
      marker: null,
      
      showMarker: function () {
        L.esri.Geocoding.geocode({ apikey: geoapiKey })
          .address(this.adresse)
          .run(function (error, response) {
            if (error) {
              console.log(error);
              return;
            }
            const location = response.results[0].latlng;
            this.marker = L.marker(location, { riseOnHover: true }).addTo(map);
            
            // Create a custom popup content
            const popupContent = `
              <h3>${this.agency}</h3>
              <p><strong>Email:</strong> ${this.email}</p>
              <p><strong>Adresse:</strong> ${this.adresse}</p>
              <p><strong>Code:</strong> ${this.code}</p>
              <p><strong>Potentiel: </strong> ${this.potential}</p>
              <p><strong>Pays :</strong> ${this.pays}</p>
              <p><strong>Numéro de Téléphone:</strong> ${this.numTel}</p>
              <p><strong>Site Facebook:</strong> <a href="${this.site_fb}" target="_blank">${this.site_fb}</a></p>
              <p><strong>Responsable:</strong> ${this.responsable}</p>
              <p><strong>Nb de Followers :</strong> ${this.nbFollower}</p>


            `;
            
            // Bind the popup to the marker
            this.marker.bindPopup(popupContent);
          }.bind(this));
      },

      removeMarker: function () {
        if (this.marker) {
          map.removeLayer(this.marker);
          this.marker = null;
        }
      }
    };

    // Add the object to the array
    objects.push(obj);
    names.push(row.Agence); // agency names to be used later for suggestions
  });

  // Return the array of objects
  return objects;
}




let objectArray ;
// Fetch data from the spreadsheet API
fetch('https://sheetdb.io/api/v1/woc4uu0ozfoig')
  .then((response) => response.json())
  .then((data) => {
    // Call the geocode function with the data
    objectArray= retrieveAgencies(data);
    
  flush();// init with all agencis

  });


  


  
  const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', search);

const showall = document.getElementById('show-all-button');
showall.addEventListener('click', flush);



function search() {
  let searchValue = document.getElementById('search-field').value;

  
  // Create a mapping between filter options and their corresponding text field values
  const filterMap = new Map();
  const comboBoxes = document.querySelectorAll('.combo-box');
  comboBoxes.forEach(comboBox => {
    const selectedOption = comboBox.value.trim();
    const textField = comboBox.nextElementSibling;
    const textFieldValue = textField.value.trim(); // Get the value from the text field
    if ( textFieldValue!="") {
      filterMap.set(selectedOption, textFieldValue);
      console.log("added " +selectedOption+" " + textFieldValue )
    }

  });
  
  let match = false;
purge();
  objectArray.forEach((obj) => {
        obj.removeMarker();
    // Check if the object matches the search value and filter conditions
    if (searchValue=="" &&filterMap.size!==0&& matchesFilters(obj, filterMap)) {

      obj.showMarker();
      displayBox(obj);
      match = true;
      map.setView([36.427392, 10.681001], 7);
      showall.disabled =false;
      console.log(filterMap.size);

    }
    else if(searchValue==obj.agency){
      if(filterMap.size!==0){
      confirm(
        "Warning: The search will be executed based on the agency name ONLY. please clear the agency name to use the filters ! ?"
      )}
      console.log(filterMap);


       
      obj.showMarker();
      displayBox(obj);
      match = true;
      map.setView([36.427392, 10.681001], 7);
      showall.disabled =false;

    }
  });

  if (!match) {
    alert("No results corresponding to you searching criteria !  ");
  }
}

// Helper function to check if an object matches filter conditions
function matchesFilters(obj, filterMap) {
  for (const filter of filterMap.keys()) {
    if (filter === 'potentiel' && obj.potential !== filterMap.get(filter)) {
      return false;
    }
    if (filter === 'followers') {
      const filterValue = filterMap.get(filter);
      const operator = filterValue.match(/^[<>]=?/); // Extract operator
      const threshold = parseFloat(filterValue.replace(/^[<>]=?/, '')); // Extract threshold value
      
      if (operator && !isNaN(threshold)) {
        switch (operator[0]) {
          case '>':
            if (!(obj.nbFollower > threshold)) {
              return false;
            }
            break;
          case '<':
            if (!(obj.nbFollower < threshold)) {
              return false;
            }
            break;
          case '>=':
            if (!(obj.nbFollower >= threshold)) {
              return false;
            }
            break;
          case '<=':
            if (!(obj.nbFollower <= threshold)) {
              return false;
            }
            break;
          default:
            return false; // Invalid operator
        }
      } else {
        return false; // Invalid filter format
      }
    }
    // Add similar conditions for other filters
  }
  return true;
}




function flush(){
  objectArray.forEach((obj) => {
      obj.showMarker();
    }
  );
  purge();
   showall.disabled=true;

}




//result boxes handler
function displayBox(row) {
  // Create the box element
  const box = document.createElement('div');
  box.classList.add('result-container'); // Add a CSS class to style the box if needed

  // Apply the CSS styles to the box
  box.style.width = '200px';
  box.style.height = '105px';
  box.style.backgroundColor = '#fff';
  box.style.padding = '10px';
  box.style.borderRadius = '5px';
  box.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

  // Create HTML content for the box
  const content = `
    <h3>${row.agency}</h3>
    <p><strong>Adresse:</strong> ${row.adresse}</p>
  `;

  // Set the content of the box
  box.innerHTML = content;

  // Append the box to the container element
  const container = document.getElementById('result-container');
  container.appendChild(box);
  box.addEventListener('click', function() {
    row.marker.openPopup();
  });
}

function purge(){

    const container = document.getElementById('result-container');
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  
  
}


// autpcomplete logic 

(function () {
  "use strict";
  let inputField = document.getElementById('search-field');
  let ulField = document.getElementById('suggestions');
  inputField.addEventListener('input', changeAutoComplete);
  ulField.addEventListener('click', selectItem);

  function changeAutoComplete({ target }) {
    let data = target.value;
    ulField.innerHTML = ``;
    if (data.length) {
      let autoCompleteValues = autoComplete(data).slice(0, 4);
      autoCompleteValues.forEach(value => { addItem(value); });
    }
  }

  function autoComplete(inputValue) {
    let destination = names;
    return destination.filter(
      (value) => value.toLowerCase().includes(inputValue.toLowerCase())
    );
  }

  function addItem(value) {
    ulField.innerHTML = ulField.innerHTML + `<li>${value}</li>`;
  }

  function selectItem({ target }) {
    if (target.tagName === 'LI') {
      inputField.value = target.textContent;
      ulField.innerHTML = ``;
    }
  }
})();








  function createCustomIcon(iconUrl) {
    return L.icon({
      iconUrl: iconUrl,
      iconSize: [15, 30],
      iconAnchor: [7, 30],
      popupAnchor: [1, -34]
    });
  }
  








//var marker = L.marker([36.427392, 10.681001], { icon: homeIcon }).addTo(map).bindPopup('Wintravel !').openPopup();



const searchControl = L.esri.Geocoding.geosearch({
        position: "topright",
        placeholder: "Enter an address or place e.g.hammamet mrezgua",
        useMapBounds: false,

        providers: [
          L.esri.Geocoding.arcgisOnlineProvider({
            apikey: geoapiKey,
            nearby: {
              lat: 36.427392,
              lng: 10.681001
            }
          })
        ]

      }).addTo(map);







