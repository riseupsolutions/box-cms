﻿
function UploadArea() { }


UploadArea.findFile = function (file, bindFiles) {
    for (var i = 0; i < bindFiles.length; i++) {
        if (file.FileUId == bindFiles[i].FileUId)
            return i;
    }
}

UploadArea.addFile = function (newFile, id, singlefile) {

    newFile.Caption = newFile.FileName;

    // it is not an upload
    $('#_uploadArea_' + id).attr('justUploaded', false);

    if (singlefile) {
        pageVM.editingItem().CONTENT[id] = newFile;
    }
    else {
        if (pageVM.editingItem().CONTENT[id] == null) {
            pageVM.editingItem().CONTENT[id] = new Array();
        }
        var bindFiles = pageVM.editingItem().CONTENT[id];
        bindFiles.push(newFile);
    }

    if (UploadArea.afterAddCallBack != null)
        UploadArea.afterAddCallBack(id, newFile.FileName);

    pageVM.editingItem.valueHasMutated();
}

UploadArea.removeFile = function (file, id, singlefile) {
    if (singlefile) {
        pageVM.editingItem().CONTENT[id] = null;
    }
    else {
        var bindFiles = pageVM.editingItem().CONTENT[id];
        var idx = UploadArea.findFile(file, bindFiles);
        bindFiles.splice(idx, 1);
    }
    pageVM.editingItem.valueHasMutated();
}

UploadArea.stopMoveFile = function (file, id, li) {

    if (UploadArea.movingFile != file)
        return;

    UploadArea.movingFile = null;
    $('#_uploadArea_' + id + ' li').each(function () { this.style.opacity = 1; });
    li.style.cursor = 'default';
    return;


}

UploadArea.startMoveFile = function (file, id, li) {

    var ul = document.getElementById('_uploadArea_' + id);
    $('#_uploadArea_' + id + ' li').each(function () { if (this != li) this.style.opacity = 0.4; });
    li.style.cursor = 'move';

    UploadArea.movingFile = file;
    var bindFiles = pageVM.editingItem().CONTENT[id];
    UploadArea.movingFileInsertIdx = UploadArea.findFile(file, bindFiles);
}

UploadArea.isMovingThis = function (file) {
    if (UploadArea.movingFile == null)
        return false;
    return (file.FileUId == UploadArea.movingFile.FileUId);
}

UploadArea.movingMouse = function (div, e, id) {

    // no moving file, get out
    if (UploadArea.movingFile == null)
        return;

    // calcs the new file position
    var newIdx = UploadArea.calcMoveInsertIdx(div, e);


    // if position did not change, get out
    var bindFiles = pageVM.editingItem().CONTENT[id];
    if (newIdx > bindFiles.length - 1 || newIdx == UploadArea.movingFileInsertIdx)
        return;

    // remove from last position       
    bindFiles.splice(UploadArea.movingFileInsertIdx, 1);

    // add at new position
    bindFiles.splice(newIdx, 0, UploadArea.movingFile);
    UploadArea.movingFileInsertIdx = newIdx;
    pageVM.editingItem.valueHasMutated();

}

UploadArea.calcMoveInsertIdx = function (div, event) {

    var x = event.pageX - div.documentOffsetLeft;
    var y = event.pageY - div.documentOffsetTop;

    var cols = parseInt(x / 120) + 1;
    var rows = parseInt(y / 90) + 1;
    return (cols * rows) - 1;
}


UploadArea.init = function () {

    if (window.FormData == null) {
        $('.ajaxUploadField').css('display', 'none');
        $('.formUploadField').css('display', 'block');
    }
    else {
        $('.ajaxUploadField').css('display', 'block');
        $('.formUploadField').css('display', 'none');
    }
}

UploadArea.showUploadForm = function (folder) {
    var w = window.open(_webAppUrl + 'cms_files/upload/?upFolder=' + folder, 'uploadFileWindow', 'menubar=0, resizable=0, width=400, height=250, location=0, toolbar=0, status=0');
}


UploadArea.sendFiles = function (files, id, folder, singleFile) {

    if (files == null || files.length <= 0)
        return;

    if (window.FormData == null)
        return;

    // marks as a upload
    $('#_uploadArea_' + id).attr('justUploaded', true);
    UploadArea.showSendAlert(id);

    var len = files.length;

    pageVM.editingItem().CONTENT[id + '_WAITING'] = new ko.observableArray([]);
    var waitingFiles = pageVM.editingItem().CONTENT[id + '_WAITING'];

    for (i = 0; i < len; i++) {
        var data = new FormData();
        data.append("file" + i, files[i]);

        waitingFiles.push({ isLoading: true, name: files[i].name });
        pageVM.editingItem.valueHasMutated();

        $.ajax({
            type: 'POST',
            url: _webAppUrl + 'api/cms_files/' + folder + '?' + '&storage=0',
            contentType: false,
            processData: false,
            data: data,
            success: function (resFiles) {
                for (var r = 0; r < resFiles.length; r++) {


                    var res = resFiles[r];

                    var newFile = { FileUId: res.FileUId, FileName: res.FileName, Size: res.Size, Folder: folder, Caption: res.FileName, Type: res.Type };

                    if (singleFile)
                        pageVM.editingItem().CONTENT[id] = newFile;

                    if (pageVM.editingItem().CONTENT[id] == null)
                        pageVM.editingItem().CONTENT[id] = new Array();

                    if (!singleFile) {
                        var bindFiles = pageVM.editingItem().CONTENT[id];
                        bindFiles.push(newFile);
                    }
                    
                    waitingFiles.pop();
                    pageVM.editingItem.valueHasMutated();

                    if (UploadArea.afterSendCallBack != null)
                        UploadArea.afterSendCallBack(id, res.FileName);

                }

            }
        });
    }

}

UploadArea.dragover = function (div, evt) {
    evt.stopPropagation();
    evt.preventDefault();
    div.classList.add('over');
};

UploadArea.dragout = function (div, evt) {
    evt.stopPropagation();
    evt.preventDefault();
    div.classList.remove('over');
};

UploadArea.drop = function (div, evt, id, folder, singleFile) {

    var bindFiles = pageVM.editingItem().CONTENT[id];

    evt.stopPropagation();
    evt.preventDefault();

    div.classList.remove('over');

    UploadArea.sendFiles(evt.dataTransfer.files, id, folder, singleFile);

}

UploadArea.showSendAlert = function (id) {
    var a = document.getElementById('_uploadAreaAlert_' + id);
    if (a == null)
        return;
    a.style.display = 'block';
}

UploadArea.hideSendAlert = function (id) {
    var a = document.getElementById('_uploadAreaAlert_' + id);
    if (a == null)
        return;
    a.style.display = 'none';
}

UploadArea.cropImage = function (image, id, width, height) {

    var picture = $('#_uploadArea_' + id + '_cropImage');

    if (picture == null || picture.length == 0)
        return;

    if (picture[0].isCroping) {
        UploadArea.cancelCropImage(id);
        return;
    }

    picture.guillotine({ width: width, height: height });
    picture[0].isCroping = true;

    UploadArea.showHideCropControls(id);
}

UploadArea.showHideCropControls = function (id) {
    var controls = $('#_uploadArea_' + id + '_cropControls');
    var zoom = $('#_uploadArea_' + id + '_cropZoom');

    if (!controls.is(':visible')) {
        $('#_uploadArea_' + id + ' li').each(function () { this._contextMenuDisabled = true; });
        controls.show();
        zoom.show();
    }
    else {
        $('#_uploadArea_' + id + ' li').each(function () { this._contextMenuDisabled = false; });
        controls.hide();
        zoom.hide();
    }
}

UploadArea.cancelCropImage = function (id) {

    var picture = $('#_uploadArea_' + id + '_cropImage');

    if (picture == null || picture.length == 0)
        return;

    picture.guillotine('remove');
    picture.css('max-width', 'none');
    picture[0].isCroping = false;

    UploadArea.showHideCropControls(id);
}

UploadArea.commitCropImage = function (id, width, height) {


    var justUploaded = $('#_uploadArea_' + id).attr('justUploaded') === 'true';

    var picture = $('#_uploadArea_' + id + '_cropImage');

    if (picture == null || picture.length == 0)
        return;

    var fileUId = picture.attr('fileUIdTag');
    var scale = parseFloat(picture.attr('scaleTag'));

    data = picture.guillotine('getData');

    data.x = data.x / scale;
    data.y = data.y / scale;
    data.w = width;
    data.h = height;

    // Sent to server        
    $.ajax({
        url: _webAppUrl + 'api/cms_imagetransform/' + fileUId + '/?createCopy=' + !justUploaded,
        type: 'POST',
        data: JSON.stringify(data),
        headers: { 'RequestVerificationToken': window._antiForgeryToken },
        success: function (data) {

            picture.guillotine('remove');
            picture[0].isCroping = false;
            UploadArea.showHideCropControls(id);

            // the fileuid my have changed, if createCopy was true
            pageVM.editingItem().CONTENT[id].FileUId = data;
            pageVM.editingItem.valueHasMutated();

            //picture[0].src = picture[0].src + '&r2=2';
        },
        error: function (request) {

            picture.guillotine('remove');
            picture[0].isCroping = false;
            UploadArea.showHideCropControls(id);

            if (request.status == 409) {
                dialogHelper.setOperationMessage(me.errorMsgItemAlreadyExists);
                return;
            }
            dialogHelper.setOperationMessage('Unknow error');
        }
    });


}

UploadArea.zoomCropImage = function (id, direction) {
    var picture = $('#_uploadArea_' + id + '_cropImage');

    if (picture == null || picture.length == 0)
        return;

    if (!picture[0].isCroping) {
        return;
    }
    picture.guillotine('zoom' + direction);
}
