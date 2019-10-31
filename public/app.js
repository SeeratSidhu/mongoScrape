
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
        $.getJSON("/articles", function(data){
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

$(document).on("click", ".btn-note", function(){
    $(".modal-title").empty();
    $(".modal-body").empty();
   

    var id = $(this).data("id");

    $.ajax({
        method: "GET",
        url: "/articles/" + id
    }).then(function(data){
        $(".modal-title").append(`<h5>${data.title}</h5>`);
        $(".modal-body").append(`<h6>Your comment</h6><br><textarea class="form-control" rows="5" cols="7" id="bodyInput"></textarea>`);
        $(".modal-body").append(`<button data-id=${data._id} id='savenote' class='btn btn-primary btn-sm' style='margin-top:20px;'data-dismiss='modal'>Save</button>`)
        console.log($("#bodyInput").val());
        if(data.note) {
            $("#bodyInput").val(data.note.body);
            console.log(data.note.body);
        }
    });
});

$(document).on("click", "#savenote", function() {
    var id = $(this).data("id");
    console.log(id);
    $.ajax({
        method:"POST",
        url: "/articles/" + id,
        data: {
            body: $("#bodyInput").val()
        }
    }).done(function(data){
        console.log(data);
        $(".modal-body").empty();
    });

    $("#bodyInput").val("");
    
});

