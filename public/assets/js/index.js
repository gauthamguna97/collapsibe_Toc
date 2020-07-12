// Your JS code goes here
let _data = [];
let subData = {};
let activeIndex = -1;
const imageList = {
  'COMPLETE': 'https://cdn0.iconfinder.com/data/icons/simple-icons-ii/69/04-512.png',
  'NOT_STARTED': 'http://www.newdesignfile.com/postpic/2010/02/black-and-white-circle-icons_153583.jpg',
  'IN_PROGRESS': 'https://getdrawings.com/free-icon/in-progress-icon-70.png',
}

function handleClick(id, index) {
  
  // handling chapter click

  if (_data[index].type === 'lesson') {
    return;
  }
  if (subData[id]) {

    // hiding / unhiding lessons

    let ele = document.getElementById(`sublist${index}`)
    if (ele.style.maxHeight) {
      document.getElementById(`svgwrap${index}`).innerHTML = `<svg height="14" width="14" stroke-width="2" stroke="#1D1D1D"><path transform="translate(5,1)" d="M0 0 L6 6 L0 12 L6 6 Z"></path></svg>`;
      ele.style.maxHeight = null;
    } else {
      document.getElementById(`svgwrap${index}`).innerHTML = `<svg height="10" width="14" stroke-width="2" stroke="black"><path transform="translate(1,2)" d="M0 0 L6 6 L12 0 L6 6 Z"></path></svg>`;
      ele.style.maxHeight = ele.scrollHeight + 'px';
    };
  } else {

    // fetch lessons if not there

    fetch(`http://localhost:3000/api/book/maths/section/${id}`)
      .then(response => response.json())
        .then(data => {
          if (data && data.statusCode === 200) {
            var out = data.response[id];
            out = out.sort((a, b) => a.sequenceNO - b.sequenceNO)
            console.log('out', out);
            subData[id] = data.response[id] || [];
          } else {
            subData[id] = [];
          }
          addsubData(id, index);
        });
  }
}

function addClickListener() {
  
  //adding click listener for chapters

  const tst = document.getElementsByClassName('listint');
  for (let i = 0; i < tst.length; i++) {
    tst[i].addEventListener('click', () => handleClick(_data[i].id, i))
  }
}


function addData() {

  // adding html for chapters

  var out = [];
  if (_data.length > 0) {
    out = _data.map((item, index) => (
      `<div class="listitem">
        <div class="listint" id=listitem${index}>
          <div class="svgwrap" id="svgwrap${index}">
            ${item.type !== 'lesson' ? 
            '<svg height="14" width="14" stroke-width="2" stroke="#1D1D1D"><path transform="translate(5,1)" d="M0 0 L6 6 L0 12 L6 6 Z"></path></svg>'
              :
            ''
            }
          </div>
          <div class="titlewrap"><span>${index + 1}.&nbsp${item.title}</span></div>
          <div class="statuswrap">
            ${item.status === 'COMPLETE' ? `<div class = "cstatus"><div class="complp" style="width: 100%"></div></div>` : ''}
            ${item.status !== 'COMPLETE' ? `<div class = "pstatus"><div class="complpp" style="width: ${item.pcent}"></div></div>` : ''}
          </div>
        </div>
        <div class="sublistwrapper" id='sublist${index}'>
        </div>
      </div>`
    ));
    out = out.join('')
    document.getElementById('appwrapper').innerHTML = out;
    addClickListener();
  }
}

function addsubData(id, index) {

  // adding html for lessons in a chapter

  var sout = [];
  console.log(subData);
  if (subData[id]) {
    sout = subData[id].map((item, _index) => (
      `<div class="sublistitem">
        <div class="sublistint">
          <div class="subsvgwrap">
           <img src=${imageList[item.status] || imageList[NOT_STARTED]} />
          </div>
          <a class="subtitlewrap"><span>${index + 1}.${_index + 1}&nbsp&nbsp<span>${item.title}</span></span></a>
        </div>
      </div>`
    ));
  }
  sout = sout.join('');
  const ele = document.getElementById(`sublist${index}`);
  ele.innerHTML = sout;
  document.getElementById(`svgwrap${index}`).innerHTML = `<svg height="10" width="14" stroke-width="2" stroke="black"><path transform="translate(1,2)" d="M0 0 L6 6 L12 0 L6 6 Z"></path></svg>`;
  ele.style.maxHeight = ele.scrollHeight + 'px';
}

// fetching chapters onLoad

window.onload = function() {
  fetch('http://localhost:3000/api/book/maths')
  .then(response => response.json())
    .then(data => {
      if (data.response && data.statusCode === 200) {
        var out = data.response || [];
        out.map((item) => {
          if (item.type === 'chapter') {
            if (item.childrenCount === item.completeCount) {
              item.status = 'COMPLETE';
            } else if (item.completeCount === 0) {
              item.status = 'NOT_STARTED';
            } else {
              item.status = 'IN_PROGRESS';
            }
            item.pcent = `${parseInt((item.completeCount / item.childrenCount) * 100, 10)}%`
          }
          return item;
        })
        _data = out.sort((a, b) => a.sequenceNO - b.sequenceNO);
        //append html
        addData()
      } else {
        return;
      }
    });
}