//main script
// vars
// selectors
const gifSelector = document.getElementById("gif");
const pngSelector = document.getElementById("png");
// dimensions
const options = {
    inv_width: document.getElementById("inv_width"),
    inv_height: document.getElementById("inv_height"),

    t_width: document.getElementById("t_width"),
    t_height: document.getElementById("t_height"),

    pad_top: document.getElementById("pad_top"),
    pad_left: document.getElementById("pad_left"),

    ticks: document.getElementById('ticks')
}
// outputs
const error = document.getElementById('error');
const output = document.getElementById('output');
const ctx = output.getContext('2d');
const prop_out = document.getElementById('prop_out');
const mcmeta_out = document.getElementById('mcmeta_out');
const gifname = document.getElementById('gifname');
const pngname = document.getElementById('pngname');
const prop_override = document.getElementById('prop_override_val')
// buttons
const update_all_btn = document.getElementById('update_all_btn');
const update_gif_btn = document.getElementById('update_gif_btn');
const overlay_png_btn = document.getElementById('overlay_png_btn');
const update_texts_btn = document.getElementById('update_texts_btn');
const clear_btn = document.getElementById('clear_btn');
// dl buttons
const download_img = document.getElementById('download_img');
const download_props = document.getElementById('download_props');
const download_mcmeta = document.getElementById('download_mcmeta');

const hmcmeta = document.getElementById('mcmeta');
const hprops = document.getElementById('props');

const type = document.getElementById('type'); // textselect (why the fuck did I name it this????)

// values so that update_vars() can update them
let inv_width = +options.inv_width.value;
let inv_height = +options.inv_height.value;
let t_width = +options.t_width.value;
let t_height = +options.t_height.value;
let ticks = +options.ticks.value;
let pad_left = +options.pad_left.value;
let pad_top = +options.pad_top.value;
let prop_override_val = prop_override.value;

let selectedpng;
let selectedgif;

// other vars
let png;
let url;
let frames = null;

function load_gif(file) {
    if (!file) return;
    if (url) {
        URL.revokeObjectURL(url);
    }
    url = URL.createObjectURL(file);
    load_frames();
}
function load_frames() {
    if (!url) return;
    gifFrames({
        url,
        frames: 'all',
        outputType: 'canvas',
        cumulative: true // need 4 shitty gifs 2 work, disables transparent gifs tho
    }).then(frameData => {
        frames = frameData.map(frame => frame.getImage());
    });

}
function load_png(file) {
    // Get the selected file from the pngSelector
    // Check if a file was selected
    if (file) {
        // Use a FileReader to read the file as a data URL
        const reader = new FileReader();

        reader.onload = function (event) {
            png = new Image();
            // The result property contains the data URL of the selected file
            png.src = event.target.result;
        };

        reader.readAsDataURL(file);
    }
}
function update_all() {
    error.textContent = ' '
    update_filenames()

    // set constants for easy use
    update_vars()

    update_gif()
    overlay_png()
    update_texts()

    error.textContent += '\nLoaded!'
}

function update_gif() {
    if (frames) {
        output.width = t_width;
        output.height = t_height * frames.length;
        frames.forEach((frame, i) => {
            let scale;
            if (frame.width / frame.height < inv_width / inv_height) {
                scale = inv_width / frame.width;
            }
            else {
                scale = inv_height / frame.height;
            }
            ctx.drawImage(
                frame,
                (frame.width - inv_width / scale) / 2,
                (frame.height - inv_height / scale) / 2,
                inv_width / scale,
                inv_height / scale,
                0 + pad_left,
                (i * t_height) + pad_top,
                inv_width,
                inv_height
            );
        });
        error.textContent += '\nLoaded GIF!'
    }
    else { error.textContent += '\nNo GIF Found!' }
}
function overlay_png() {
    if (png) {
        // Get a reference to your canvas element (assuming it has the id "canvas")

        // Create an image element and set its source to the PNG data
        let img = new Image();
        img.src = png.src;
        // Draw the image onto the canvas
        img.onload = function () {
            var maxheight = (output.height - t_height);
            var curheight = 0;
            while (curheight <= maxheight) {
                ctx.drawImage(img, 0, curheight);
                curheight += Number(t_height)
            };
        }
        error.textContent += '\nOverlayed PNG!'
    }
    error.textContent += '\nNO PNG Found!'
}
function update_texts() {
    update_filenames()
    update_vars()

    var propcontent = "duration = " + ticks +
        "\nh = " + t_height +
        "\nw = " + t_width +
        "\nx = 0" +
        "\ny = 0" +
        "\nfrom = ./TEXTURENAME.png" +
        "\nto = " + prop_override_val;

    var metacontent = JSON.stringify({
        animation: {
            frametime: ticks
        }
    }, null, 2);

    prop_out.textContent = propcontent
    mcmeta_out.textContent = metacontent
    error.textContent += '\nLoaded Text Contents!'
}
function update_vars() {

    inv_width = +options.inv_width.value;
    inv_height = +options.inv_height.value;
    t_width = +options.t_width.value;
    t_height = +options.t_height.value;
    ticks = +options.ticks.value;
    pad_left = +options.pad_left.value;
    pad_top = +options.pad_top.value;

    prop_override_val = prop_override.value;
}

function clear_output() {
    prop_out.textContent = ' ';
    mcmeta_out.textContent = ' ';
    ctx.clearRect(0, 0, output.width, output.height);
    output.width = 16
    output.height = 16
    error.textContent = ' '
    show_content(hprops)
    show_content(prop_out)
    show_content(hmcmeta)
    show_content(mcmeta_out)
}
function hide_content(content) {
    content.classList.add('invis')
}
function show_content(content) {
    content.classList.remove('invis')
}
function update_filenames() {
    if (selectedgif) {
        gifname.textContent = ''
        gifname.textContent += selectedgif.name
    }
    if (selectedpng) {
        pngname.textContent = ''
        pngname.textContent += selectedpng.name
    }
}

gifSelector.addEventListener('change', e => {
    selectedgif = gifSelector.files[0]
    load_gif(selectedgif);
    update_filenames();
});
pngSelector.addEventListener("change", e => {
    selectedpng = pngSelector.files[0]
    load_png(selectedpng);
    update_filenames();
});

type.addEventListener('change', e => {
    switch (type.value) {
        case 'mcmeta': {
            hide_content(hprops)
            hide_content(prop_out)
            hide_content(prop_override)

            show_content(hmcmeta)
            show_content(mcmeta_out)
            break;
        }
        case 'properties': {
            hide_content(hmcmeta)
            hide_content(mcmeta_out)

            show_content(hprops)
            show_content(prop_override)
            show_content(prop_out)
            break;
        }
        case 'both': {
            show_content(hmcmeta)
            show_content(mcmeta_out)
            show_content(hprops)
            show_content(prop_out)
            show_content(prop_override)
            break;
        }
    }
})

download_img.addEventListener('click', e => {
    output.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'TEXTURENAME.png';
        link.href = url;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });
});
download_props.addEventListener('click', e => {
    var exporttext = prop_out.textContent
    var blob = new Blob([exporttext]);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.download = 'TEXTURENAME.properties';
    link.href = url;

    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
});
download_mcmeta.addEventListener('click', e => {
    var exporttext = mcmeta_out.textContent
    var blob = new Blob([exporttext]);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.download = 'TEXTURENAME.png.mcmeta';
    link.href = url;

    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
});

update_all_btn.addEventListener('click', e => {
    error.textContent = ' '
    update_all()
});
update_gif_btn.addEventListener('click', e => {
    error.textContent = ' '
    update_gif()
})
overlay_png_btn.addEventListener('click', e => {
    error.textContent = ' '
    overlay_png()
})
update_texts_btn.addEventListener('click', e => {
    error.textContent = ' '
    update_texts()
})
clear_btn.addEventListener('click', clear_output);

clear_output() // initially clear output :3