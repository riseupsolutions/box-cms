﻿var nicEditorCleanFormatButton = nicEditorSelect.extend({
    init: function () {
        var icon = this.ne.options.iconsPath.replace('nicEditorIcons.gif', '') + 'clean.png';
        this.setDisplay('<img src="' + icon + '" width="18" height="18"/>');
        this.add('onlyStyle', nicEditorStrings.cleanOnlyStyle);
        this.add('breakLines', nicEditorStrings.keepBreakLines);
        this.add('cleanAll', nicEditorStrings.cleanAll);
        
    }
});


var nicCleanFormatOptions = {
    buttons: {
        'cleanFormat': {
            name: __('Clean Format'), type: 'nicEditorCleanFormatButton',
            externalCommand: function (ne, option) {
                var nic = ne.selectedInstance;
                var text = nic.frameDoc.body.innerHTML;

                if (option == 'onlyStyle') {                    
                    text = text.replace(/<((?!a)\w+)(.|\n|&quot;)*?>/g, '<$1>');
                    text = text.replace(/<font>/g, '');
                    text = text.replace(/<\/font>/g, '');
                    text = text.replace(/<span>/g, '');
                    text = text.replace(/<\/span>/g, '');
                    text = text.replace(/<&nbsp;>/g, '');
                }
                else if (option == 'breakLines') {
                    text = $('<div>' + text + '</div>').text();
                    text = text.replace(/\n/g, '<br>');
                }
                else {
                    text = $('<div>' + text + '</div>').text();
                }
                                
                // this replace all urls
                text = text.split(window.location.href).join('');

                // this replace word references
                text = text.replace(/href="(.*)#_ftn(.*)"/g, 'href="#_ftn$2"');

                nic.frameDoc.body.innerHTML = text;


                if (nic.onChange != null)
                    nic.onChange();

            }
        },
    }
    
};

nicEditors.registerPlugin(nicPlugin, nicCleanFormatOptions);