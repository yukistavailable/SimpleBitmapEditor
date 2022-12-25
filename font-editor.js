//Initial references
let container = document.querySelector(".container");
let gridButton = document.getElementById("submit-grid");
let clearGridButton = document.getElementById("clear-grid");
let gridWidth = document.getElementById("width-range");
let grayScale = document.getElementById("gray-scale");
let eraseBtn = document.getElementById("erase-btn");
let paintBtn = document.getElementById("paint-btn");
let pushBtn = document.getElementById("push-btn");
let widthValue = document.getElementById("width-value");
let grayScaleValue = document.getElementById("gray-scale-value");

const apiUrl = new URL('http://178.128.83.251/admin/v1/bitmap');
const url = apiUrl.toString();

async function postBitmap(value) {
  data = {
    'value': value,
    'kanji': '魚'
  };
  console.log(data);
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
        console.log('move')
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
  let grayScales = new Array();
  for (const gridCol of gridCols) {
    let color = gridCol.style.backgroundColor;
    let grayScale = 255;
    if (color) {
      let rgb = parse_rgb_string(color);
      grayScale = Number(rgb[0]);
    }
    grayScales.push(grayScale);
  }
  stringGrayScales = grayScales.join(',');
  const response =   postBitmap(stringGrayScales);
  console.log(response);
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
