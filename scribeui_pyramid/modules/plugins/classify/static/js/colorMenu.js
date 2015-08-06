function colorMenu(){
    this.colors = [];
    var self = this;

    //Create the dialog
    var dialogDiv = $('<div id="colorMenu-dialog"/>');
    dialogDiv.load("classify/html/colorMenu.html", null, function() {
        //Dialog done loading
        dialogDiv.hide();
        $('.main').append(dialogDiv);

        //Setup events
        //Add single color
        $('#colorMenu-color-single-button').click(function(){
            self.colors.push($('#colorMenu-color-single-input').val());
            self.updateSelectedColors();
        });

        //Add color range
        $('#colorMenu-color-range-button').click(function(){
            var nbColors = parseInt($('#colorMenu-numberOfColors').val());
            var color1 = $('#colorMenu-color1').val();
            var color2 = $('#colorMenu-color2').val();
            if(nbColors > 0 && color1 && color2){
                var colorRange = self.generateColorRange(nbColors, color1, color2);
                self.colors = $.merge(self.colors, colorRange);
                self.updateSelectedColors();
            }
        });
    });
}

/*  Open the colorMenu dialog
 *  Paramters:
 *      - callback, function telling us what to do with the colors when
 *                  closing the dialog
 */
colorMenu.prototype.open = function(callback){
    var self = this;
    $("#colorMenu-dialog").dialog({
        autoOpen: false,
        resizable: false,
        modal: true,
        width: "420px",
        title: "Select colors",
        buttons: {
            Confirm: function(){
                callback(self.colors);
                $(this).dialog("close");
            },
            Cancel: function(){
                $(this).dialog("close");
            }
        },
        close: function() {}
    }).dialog("open");
};

//Update the field containing the colors preview
colorMenu.prototype.updateSelectedColors = function(){
    var self = this;
    var colorsContainer = $('.colorMenu-selected-colors');
    colorsContainer.empty();
    $.each(this.colors, function(i, item) {
        var colorSquare = $("<div>",
            {class: "colorMenu-colorSquare"}
         );
        colorSquare.css('background-color', item);
        colorSquare.data("number", i);
        colorSquare.click(function(){
            self.colors.splice($(this).data("number"), 1);
            self.updateSelectedColors();
        })
        colorsContainer.append(colorSquare);
    });
}

//Create an a array of colors ranging between color1 and color2
colorMenu.prototype.generateColorRange = function(
        numberOfColors, color1, color2){
    colorRange = [];
    color1 = tinycolor(color1);
    color2 = tinycolor(color2);
    var step = 100 / (numberOfColors - 1); //Percentage of mix
    for(var i = 0; i < 100; i += step){
        colorRange.push(
            tinycolor.mix(color1, color2, amount = i).toHexString());
    }
    colorRange.push(color2.toHexString());
    return colorRange;
}
