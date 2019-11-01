
var commentArray = [];
function displayNews(data) {
    for (var i = 0; i < data.length; i++) {
        var card = `
            <div class="card">
                <h5 class="card-header"><a href = "${data[i].link}" target = "_blank">${data[i].title}</a></h5>
                <div class="card-body">
                    <p class="card-text">${data[i].body}</p>
                    <button type="button" class="btn-note btn btn-info btn-lg" data-toggle='modal' data-target='#myModal' data-id=${data[i]._id}>Leave Comment</button>
                </div>
            </div>`;
        $("#newsCard").append(card);

    };
};


$("#scrapeButton").on("click", function () {
    $("#newsCard").html("");
    console.log("running");
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).done(function () {
        $.getJSON("/articles", function (data) {
            displayNews(data);
        });
    });


});

$("#clearButton").on("click", function () {
    $.ajax({
        method: "DELETE",
        url: "/clear"
    }).then(function () {
        $("#newsCard").empty();
        location.reload();
    })
});

$(document).on("click", ".btn-note", function () {
    $(".modal-title").empty();
    $(".input").empty();
    $(".note-container").empty();


    var id = $(this).data("id");
    console.log(id);
    $.ajax({
        method: "GET",
        url: "/articles/" + id
    }).then(function (data) {
        $(".modal-title").append(`<h5>${data.title}</h5>`);
        $(".input").append(`<h6>Your comment</h6><br><textarea class="form-control" rows="5" cols="7" id="bodyInput"></textarea>`);
        $(".input").append(`<button data-id=${data._id} id='savenote' class='btn btn-primary btn-sm' style='margin-top:20px;'data-dismiss='modal'>Save</button>`)
        if (data.note) {
            for (var i = 0; i < data.note.length; i++) {
                $(".note-container").append(`<li class="list-group-item">${data.note[i].body} <button type="button" class=" btn-delete btn btn-dark btn-sm" data-id=${data.note[i]._id} style="float:right" data-dismiss='modal'>Delete</button></li>`);
            }
        }
    });
});

$(document).on("click", "#savenote", function () {
    var id = $(this).data("id");
    var currentComment = $("#bodyInput").val();
    if (currentComment) {
        $.ajax({
            method: "POST",
            url: "/articles/" + id,
            data: {
                body: $("#bodyInput").val()
            }
        }).done(function (data) {
            console.log(data);
            $(".input").empty();
        });
    }

    $("#bodyInput").val("");

});

$(document).on("click", ".btn-delete", function () {
    var id = $(this).data("id");
    $.ajax({
        method: "DELETE",
        url: "/remove/" + id
    }).then(function () {
        console.log("Comment Deleted");
    });
});


