/**
 * Created by Adebola on 08/02/2016.
 */
$(document).ready(function () {
    $.getJSON("./data.json", function (data) {
        var oControl = $("#sampleWaveform");
        //var iWaveFormWidth = oControl.width();
        var iWaveFormWidth = 800;
        var iWaveformHeight = 90;
        //var oControl = newDiv();
        //console.log(oControl);
        if (!0) {
            console.log(data);
            window.o = new Waveform({
                container: oControl[0],
                data: data,
                width: iWaveFormWidth,
                height: iWaveformHeight,
                trackLength: 217, // for wonder wizkid
                reflection: 0.1,
                waveWidth: 2,
                interpolate: true,
                bindResize: true    // to make the waveform bind to the resize event of the window!!
            });

            window.o.observe(Waveform.EVENT_RESIZED, function(iWidth){
                console.log("width changed to ", iWidth);
            });
        }
    });




    var derp = document.querySelectorAll('canvas');
    for(var i=0; i<derp.length; i++) {
        derp[i].style.border = 'solid 1px #d1d1d1';
    }

    function newDiv() {
        var div = document.createElement('div');
        document.body.appendChild(div);
        return div;
    }

    var gui_ = function() {
        this.width = 800;
        this.heigth = 200;
        this.gutterWidth = 1;
        this.waveWidth = 2;
        this.reflection = 0;
        this.play = function(){
            console.log("playing should start here now!");
            window.o.play()
        };
        this.pause = function(){
            window.o.pause()
        }
    };

    function datGui() {
        var text = new gui_();
        var gui = new dat.GUI();

        var width = gui.add(text, 'width', 0, 1800).step(10);

        var height = gui.add(text, 'heigth', 0, 300).step(1);

        var gutterWidth = gui.add(text, 'gutterWidth', 0, 10).step(1);

        var waveWidth = gui.add(text, 'waveWidth', 0, 50).step(1);

        var reflection = gui.add(text, 'reflection', 0, 0.5);

        gui.add(text, 'play');

        gui.add(text, 'pause');


        width.onChange(function(value) {
            window.o.update({width: value})
        });

        height.onChange(function(value) {
            window.o.update({height: value})
        });

        gutterWidth.onChange(function(value) {
            window.o.update({gutterWidth: value})
        });

        waveWidth.onChange(function(value) {
            window.o.update({waveWidth: value})
        });

        reflection.onChange(function(value) {
            window.o.update({reflection: value})
        });
    }

    datGui()

});