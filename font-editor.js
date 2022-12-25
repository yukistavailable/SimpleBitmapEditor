//Initial references
let container = document.querySelector(".container");
let gridButton = document.getElementById("submit-grid");
let clearGridButton = document.getElementById("clear-grid");
let gridWidth = document.getElementById("width-range");
let grayScale = document.getElementById("gray-scale");
let eraseBtn = document.getElementById("erase-btn");
let paintBtn = document.getElementById("paint-btn");
let pushBtn = document.getElementById("push-btn");
let pullBtn = document.getElementById("pull-btn");
let topBtn = document.getElementById("top-btn");
let bottomBtn = document.getElementById("bottom-btn");
let leftBtn = document.getElementById("left-btn");
let rightBtn = document.getElementById("right-btn");
let widthValue = document.getElementById("width-value");
let grayScaleValue = document.getElementById("gray-scale-value");

const apiUrl = new URL('https://piyopiyo.de/v1/bitmap');
// const apiUrl = new URL('http://localhost/v1/bitmap');
const url = apiUrl.toString();

async function postBitmap(value, char, memo) {
  data = {
    'value': value,
    'kanji': char,
    'memo': memo
  };
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    });
    return response.json();

}

async function getBitmap() {
  const id = document.getElementById("pull-id").value;
  const getUrl = url + '/' + id;
    const response = await fetch(getUrl);
    const data = await response.json();
    return data;
}

//Events object
let events = {
  mouse: {
    down: "mousedown",
    move: "mousemove",
    up: "mouseup",
  },
  touch: {
    down: "touchstart",
    move: "touchmove",
    up: "touchend",
  },
};

let deviceType = "";

//Initially draw and erase would be false
let draw = false;
let erase = false;

//Detect touch device
const isTouchDevice = () => {
  try {
    //We try to create TouchEvent(it would fail for desktops and throw error)
    document.createEvent("TouchEvent");
    deviceType = "touch";
    return true;
  } catch (e) {
    deviceType = "mouse";
    return false;
  }
};

// function to convert int to hex string with zero paddings
const toHexString = (num, len) => {
    let str = num.toString(16);
    return "#" + "0".repeat(len - str.length) + str;
}

isTouchDevice();

//Create Grid
gridButton.addEventListener("click", () => {
  //Initially clear the grid (old grids cleared)
  container.innerHTML = "";
  //count variable for generating unique ids
  let count = 0;
  //loop for creating rows
  for (let i = 0; i < gridWidth.value; i++) {
    //incrementing count by 2
    count += 2;
    //Create row div
    let div = document.createElement("div");
    div.classList.add("gridRow");
    //Create Columns
    for (let j = 0; j < gridWidth.value; j++) {
      count += 2;
      let col = document.createElement("div");
      col.classList.add("gridCol");
      /* We need unique ids for all columns (for touch screen specifically) */
      col.setAttribute("id", `gridCol${count}`);

      /*
      For eg if deviceType = "mouse"
      the statement for the event would be events[mouse].down which equals to mousedown
      if deviceType="touch"
      the statement for event would be events[touch].down which equals to touchstart
       */

      col.addEventListener(events[deviceType].down, () => {
        //user starts drawing
        draw = true;
        //if erase = true then background = transparent else color
        if (erase) {
          col.style.backgroundColor = "transparent";
        } else {
          // col.style.backgroundColor = colorButton.value;
          v = grayScale.value * 0x010101;
          col.style.backgroundColor = toHexString(v, 6);
        }
      });

      col.addEventListener(events[deviceType].move, (e) => {
        /* elementFromPoint returns the element at x,y position of mouse */
        let elementId = document.elementFromPoint(
          !isTouchDevice() ? e.clientX : e.touches[0].clientX,
          !isTouchDevice() ? e.clientY : e.touches[0].clientY
        ).id;
        //checker
        checker(elementId);
      });
      //Stop drawing
      col.addEventListener(events[deviceType].up, () => {
        draw = false;
      });
      //append columns
      div.appendChild(col);
    }
    //append grid to container
    container.appendChild(div);
  }
});

// Shift the grid to the top
topBtn.addEventListener("click", () => {
    let grid = document.getElementsByClassName('gridCol');
    for (let i = 0; i < grid.length - Number(gridWidth.value); i++) {
        grid[i].style.backgroundColor = grid[i + Number(gridWidth.value)].style.backgroundColor;
    }
    for (let i = grid.length - Number(gridWidth.value); i < grid.length; i++) {
        grid[i].style.backgroundColor = 'transparent';
    }
});

bottomBtn.addEventListener("click", () => {
  let grid = document.getElementsByClassName('gridCol');
  for (let i = grid.length-1; i > Number(gridWidth.value)-1; i--) {
    grid[i].style.backgroundColor = grid[i - Number(gridWidth.value)].style.backgroundColor;
  }
  for (let i = 0; i < Number(gridWidth.value); i++) {
    grid[i].style.backgroundColor = 'transparent';
  }
});

leftBtn.addEventListener("click", () => {
    let grid = document.getElementsByClassName('gridCol');
    for (let i = 0; i < grid.length; i++) {
        if (i % Number(gridWidth.value) === 0) {
        for (let j = 0; j < Number(gridWidth.value) - 1; j++) {
            grid[i+j].style.backgroundColor = grid[i+j+1].style.backgroundColor;
        }
        grid[i+Number(gridWidth.value)-1].style.backgroundColor = 'transparent';
        }
    }
})

rightBtn.addEventListener("click", () => {
    let grid = document.getElementsByClassName('gridCol');
    for (let i = 0; i < grid.length; i++) {
        if (i % Number(gridWidth.value) === 0) {
        for (let j = Number(gridWidth.value) - 1; j > 0; j--) {
            grid[i+j].style.backgroundColor = grid[i+j-1].style.backgroundColor;
        }
        grid[i].style.backgroundColor = 'transparent';
        }
    }
})

function checker(elementId) {
  let gridColumns = document.querySelectorAll(".gridCol");
  //loop through all boxes
  gridColumns.forEach((element) => {
    //if id matches then color
    if (elementId == element.id) {
      if (draw && !erase) {
        // element.style.backgroundColor = colorButton.value;
        v = grayScale.value * 0x010101;
        element.style.backgroundColor = toHexString(v, 6);
      } else if (draw && erase) {
        element.style.backgroundColor = "transparent";
      }
    }
  });
}

//Clear Grid
clearGridButton.addEventListener("click", () => {
  container.innerHTML = "";
});
//Erase Button
eraseBtn.addEventListener("click", () => {
  erase = true;
});

//Paint button
paintBtn.addEventListener("click", () => {
  erase = false;
});

const parse_rgb_string = (rgb) => {
    rgb = rgb.replace(/[^\d,]/g, '').split(',');
    return rgb;
};

pushBtn.addEventListener("click", () => {
  let gridCols = document.getElementsByClassName('gridCol');
  let greyScales = new Array();
  let char = document.getElementById("char").value;
  let memo = document.getElementById("memo").value;

  // if char is empty, alert
    if (char === "") {
        alert("Please enter a character");
        return;
    }
  for (const gridCol of gridCols) {
    let color = gridCol.style.backgroundColor;
    let greyScale = 255;
    if (color) {
      if (color !== 'transparent') {
        let rgb = parse_rgb_string(color);
        greyScale = Number(rgb[0]);
      }
    }
    greyScales.push(greyScale);
  }
  stringGreyScales = greyScales.join(',');
  const response = postBitmap(stringGreyScales, char, memo);
  response.then((data) => {
    id = data;
    document.getElementById("pull-id").value = id;

    alert("Successfully submitted. Your ID is " + id);
  });
})

pullBtn.addEventListener("click", () => {
    const response = getBitmap();
    response.then((data) => {
        let greyScales = data['value'].split(',');
        let gridCols = document.getElementsByClassName('gridCol');
        let i = 0;
        for (const gridCol of gridCols) {
          let greyScale = greyScales[i];
          if (greyScale === 255) {
              gridCol.style.backgroundColor = 'transparent';
          } else {
              gridCol.style.backgroundColor = `rgb(${greyScale}, ${greyScale}, ${greyScale})`;
          }
          i++;
        }
        document.getElementById("char").value = data['kanji'];
        document.getElementById("memo").value = data['memo'];
    });
})


//Display grid width and height
gridWidth.addEventListener("input", () => {
  widthValue.innerHTML =
    gridWidth.value < 9 ? `0${gridWidth.value}` : gridWidth.value;
});

grayScale.addEventListener("input", () => {
  grayScaleValue.innerHTML = grayScale.value;
});

gridWidth.value = 80;
grayScale.value = 0;
grayScaleValue.innerHTML = grayScale.value;

widthValue.innerHTML =
    gridWidth.value < 9 ? `0${gridWidth.value}` : gridWidth.value;

//Click on grid button to create grid
gridButton.click();