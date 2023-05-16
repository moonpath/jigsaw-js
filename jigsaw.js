function getSteps(id, rows) {
    const steps = [];
    let index = -1;
    const numberId = Number(id);
    if (numberId >= rows) steps[++index] = numberId - rows;
    if (numberId % rows !== rows - 1) steps[++index] = numberId + 1;
    if (numberId < rows * rows - rows) steps[++index] = numberId + rows;
    if (numberId % rows !== 0) steps[++index] = numberId - 1;
    return steps;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function count() {
    document.getElementById("time_label").innerHTML = "Time: " + secondsCount++ + "s";
}

function switchPic() {
    if (document.getElementById("preview").dataset.value === src){
        document.getElementById("preview_img").src = donateSrc;
        document.getElementById("preview").dataset.value = donateSrc;
    }
    else{
        document.getElementById("preview_img").src = src;
        document.getElementById("preview").dataset.value = src;
    }
}

async function start() {
    state = true;
    secondsCount = 0;
    clearInterval(countTimer);
    const rows = Number(document.getElementById("rows").value);
    generateControl(src);
    generateBox(rows, src);
    document.getElementById("img_" + String(rows * rows - 1)).style.opacity = "0.1";
    document.getElementById("preview_img").src = donateSrc;
    document.getElementById("preview").dataset.value = donateSrc;

    for (let times = rows * rows * 10, deletion = rows * rows - 1; times > 0; --times) {
        const steps = getSteps(deletion, rows);
        const index = Math.floor((Math.random() * steps.length));
        move(deletion, steps[index]);
        deletion = steps[index];

        await sleep(10);
    }
    countTimer = setInterval(count, 1000);
}

function config() {
    state = false;
    clearInterval(countTimer);
    document.getElementById("time_label").innerHTML = "Jigsaw";
    if (!configState) {
        document.getElementById("rows").disabled = false;
        document.getElementById("records_button").disabled = true;
        document.getElementById("start_button").disabled = true;

        const srcTop = document.getElementById("control").getBoundingClientRect().bottom;
        const srcWidth = document.getElementById("control").getBoundingClientRect().right;
        const diff = document.body.getBoundingClientRect().left;

        document.getElementById("src").style.top = `${srcTop + diff}px`;
        document.getElementById("src").style.width = `${srcWidth - diff * 2}px`;
        document.getElementById("src_input").value = document.getElementById("img_0").src;
        document.getElementById("src").style.display = "block";

        configState = true;
    } else {
        const rows = Number(document.getElementById("rows").value);
        src = document.getElementById("src_input").value;
        document.getElementById("src").style.display = "none";
        generateControl(src);
        generateBox(rows, src);
        document.getElementById("rows").disabled = true;
        document.getElementById("records_button").disabled = false;
        document.getElementById("start_button").disabled = false;
        configState = false;
    }
}

function judge(rows) {
    let flag = true;
    for (let i = 0; i < rows * rows; ++i) {
        if (document.getElementById(i.toString()).dataset.value !== i.toString())
            flag = false;
    }
    if (flag) {
        document.getElementById("img_" + String(rows * rows - 1)).style.opacity = "1";
        clearInterval(countTimer);
        state = false;
    }
}

function response(id, rows) {
    if (!state) return;
    const steps = getSteps(id, rows);
    for (let index in steps) {
        const indexValue = document.getElementById(steps[index]).dataset.value;
        if (Number(indexValue) === rows * rows - 1) {
            move(id, steps[index]);
            break;
        }
    }
    judge(rows);
}

function move(id1, id2) {
    const tempInner = document.getElementById(id1).innerHTML;
    document.getElementById(id1).innerHTML = document.getElementById(id2).innerHTML;
    document.getElementById(id2).innerHTML = tempInner;

    const tempValue = document.getElementById(id1).dataset.value;
    document.getElementById(id1).dataset.value = document.getElementById(id2).dataset.value;
    document.getElementById(id2).dataset.value = tempValue;
}

function generateBox(rows, src) {
    const ratio = 0.7;
    const margin = document.body.getBoundingClientRect().left;
    const validWidth = (window.innerWidth - margin * 2) * ratio / rows;
    const validHeight = (window.innerHeight - margin * 2) / rows;
    const length = validWidth > validHeight ? validHeight : validWidth;

    let html = "";
    for (let r = 0, top = 0; r < rows; ++r) {
        let left = 0;
        for (let c = 0; c < rows; ++c) {
            const id = r * rows + c;
            const imgStyle = `position: absolute;top: ${-r * length}px;left: ${-c * length}px;width: ${length * rows}px;height: ${length * rows}px;clip: rect(${r * length}px,${(c + 1) * length}px,${(r + 1) * length}px,${c * length}px);`;
            const img = `<img id=${"img_" + id} style="${imgStyle}" oncontextmenu="return false;" draggable="false" src=${src} alt="${id}">`;
            const divStyle = `position: absolute;top: ${top}px;left: ${left}px;width: ${length}px;height: ${length}px;`;
            const onClick = `response(${id}, ${rows}, ${rows})`;
            html += `<div style="${divStyle}" id="${id}" data-value="${id}" onclick="${onClick}">${img}</div>`;
            left += length;
        }
        top += length;
    }
    document.getElementById("sandbox").innerHTML = html;
}

function generateControl(src) {
    const ratio = 0.7;
    const margin = document.body.getBoundingClientRect().left;
    const validWidth = (window.innerWidth - margin * 2) * ratio;
    const validHeight = window.innerHeight - margin * 2;
    const length = validWidth > validHeight ? validHeight : validWidth;

    const sandboxWidth = length;
    const sandboxHeight = length;
    const controlWidth = sandboxWidth / ratio * (1.0 - ratio) - margin;
    const controlHeight = sandboxHeight / ratio * (1.0 - ratio) - margin;
    const minLength = controlWidth > controlHeight ? controlHeight : controlWidth;

    document.getElementById("control").style.top = `${margin}px`;
    document.getElementById("control").style.left = `${sandboxWidth + margin * 2}px`;
    document.getElementById("control").style.height = `${sandboxHeight}px`;
    document.getElementById("control").style.width = `${minLength}px`;
    document.getElementById("padding_top").style.height = `${sandboxHeight * 0.01}px`;
    document.getElementById("padding_bottom").style.height = `${sandboxHeight * 0.01}px`;

    document.getElementById("preview").style.width = `${minLength}px`;
    document.getElementById("preview").style.height = `${minLength}px`;
    document.getElementById("preview").style.margin = "0 auto";
    document.getElementById("preview").dataset.value = src;
    document.getElementById("preview").innerHTML = `<img id="preview_img" src="${src}" style="width: 100%;height: 100%" alt="preview">`;

    document.getElementById("time_label").style.margin = `${sandboxHeight * 0.02}px`;
    document.getElementById("config").style.height = `${sandboxHeight * 0.1}px`;
    document.getElementById("records").style.height = `${sandboxHeight * 0.1}px`;
    document.getElementById("start").style.height = `${sandboxHeight * 0.1}px`;

    document.getElementById("split1").style.height = `${sandboxHeight * 0.05}px`;
    document.getElementById("split2").style.height = `${sandboxHeight * 0.05}px`;
}
