$.ajax({
    type:'GET',
    url: 'api/isauth',
    contentType: 'application/json',
}).done(function(msg){
    if(msg == 'false')
        window.location = 'login.html';
    else
        loadGlobal();
});

function loadGlobal() {
    $.ajax({
        type:'GET',
        url: 'api/rec',
        contentType: 'application/json',
    }).done(function(msg){
        console.log(msg);
        msg = _.sortBy(_.uniq( _.flatten(msg), function(item,key,a) {return item.name.value;}), function(item){return item.rating.value; }).reverse()
        populate(msg);
    });
}

function populate(movies){
  if (movies.length == 0){
    $('#rec').html("Too few likes to give recommendation yet! Please like a few more Direcotrs, Movies, Acotrs and Genres");
  }
  else{
    $('.movie-rec').off('click');
    $('#rec').html('');
    /*movies = _.uniq(movies, function(item,key,a){
      return item.name.value;
    })*/
    var i = 0, j=0;
    for(i=0;i<movies.length;i+=3){
      html = "<br><br><div class='row'>"
      $('#rec').append(html);
      for(j=0;j<3;j++){
        if(i+j >= movies.length)
          break;
        name = movies[i+j].name.value;
        poster = movies[i+j].poster.value;
        year = '('+movies[i+j].year.value+')';
        html = "<div class='col-xs-4 movie-rec' ><img src='"+poster+"' id='movie"+(i+j)+"'></img><br><span>"+name+year+"</div>";
        $('#rec').append(html);
        id = '#movie'+(i+j);
        $(id).on('click',{'item':movies[i+j]}, function(e){
          load_movie(e.data);
        });
      }
      $('#rec').append("</div>");
    }
  }
}
  function getType(item) {
    console.log(item);
    var type = '';
    genreList = ["Horror", "Crime", "Drama", "Thriller", "Animation", "Fantasy", "Comedy", "Mystery", "Action", "Documentary", "Romance", "Sci-Fi", "Musical", "Family", "War", "Sport", "Biography", "Adventure", "History", "Music", "Western"];
    name = typeof(item.name.value) == "undefined" ? item.name : item.name.value;
    if(typeof(item.storyline) != 'undefined'){
        type = 'Movie'
    }
    else if(typeof(item.photo) != 'undefined'){
        type = 'Actor'
    }
    else if(_.indexOf(genreList, name) == -1 ){
        type = 'Director'
    }
    else{
        type = 'Genre'
    }
    return type;
}


$(".name-search").autocomplete({
  source: function( request, respond ){
    $.ajax({
      type:'GET',
      url:'api/search/'+request.term,
      contentType: 'application/json',
    }).done(function(msg){
      respond(msg);
    })
  }
  }).data("ui-autocomplete")._renderItem = function( ul, item ) {
    item.type = getType(item);
    return $( "<li><a><p class='auto-left'>"+item.type+":</p><p class='auto-center'>"+item['name']['value']+(item.type == 'Movie' ? ' ('+item['year']['value']+')':'')+"</p></a></li>" ).appendTo( ul );
  };


  $( ".name-search" ).bind( "autocompleteselect", function( event, ui ) {
      console.log(ui.item.type);
    //console.log("selected");
    if(ui.item.type == 'Movie'){
        load_movie(ui);
    }

    else if(ui.item.type == 'Actor'){
      $('#like-actor').prop('disabled', false);
      $('#actor-title').html(ui['item']['name']['value']);
      $('#actor-image').attr('src',ui['item']['photo']['value']);
      $('#imdb-link').html("<a href='http://www.imdb.com/"+ui['item']['imdblink']['value']+"'>"+ui['item']['imdblink']['value']+"</a>");
    $('#vertexActorId').html(ui['item']['_id'])
      $('#actor-modal').modal('show');
      var movies = "";
      $.ajax({
        type:'GET',
        url:'api/details/actor/'+ui['item']['_id'],
        contentType: 'application/json',
      }).done(function(msg){
        var i=0;
        for(i=0;i<msg.length;i++){
          movies = msg[i]['name']+"("+msg[i]['year']+")"+"<br>" + movies;
        }
      $('#actor-movies').html(movies);
    });

      $.ajax({
        type:'GET',
        url:'api/isliked/'+ui['item']['_id'],
        contentType: 'application/json',
      }).done( function(msg){
          if(msg[0] > 0){
            $('#like-actor').prop('disabled', true);
          }
          else{
            $('#like-actor').on('click', function(e){
              $.ajax({
                type:'POST',
                url:'api/like/'+ui['item']['_id'],
                contentType: 'application/json',
            }).done( function(msg){
              $('#like-actor').prop('disabled', true);
              alert('liked');
            });
          });
        }
      });
  }


  else if(ui.item.type == 'Director' | ui.item.type == 'Genre'){
    path = ui.item.type == 'Director' ? 'api/details/director/' : 'api/details/genre/';
    $('#like-director').prop('disabled', false);
    $('#director-title').html(ui['item']['name']['value']);
  $('#vertexDirectorId').html(ui['item']['_id'])
    $('#director-modal').modal('show');
      var movies = "";
      $.ajax({
        type:'GET',
        url: path + ui['item']['_id'],
        contentType: 'application/json',
      }).done(function(msg){
        var i=0;
        for(i=0;i<msg.length;i++){
          movies = msg[i]['name']+"("+msg[i]['year']+")"+"<br>" + movies
        }
      $('#director-movies').html(movies);
    });

    $.ajax({
        type:'GET',
        url:'api/isliked/'+ui['item']['_id'],
        contentType: 'application/json',
      }).done( function(msg){
          if(msg[0] > 0){
            $('#like-director').prop('disabled', true);
          }
          else{
            $('#like-director').on('click', function(e){
              $.ajax({
                type:'POST',
                url:'api/like/'+ui['item']['_id'],
                contentType: 'application/json',
            }).done( function(msg){
              $('#like-director').prop('disabled', true);
              alert('liked');
            });
          });
        }
      });




  }
});

$('#movie-modal').on('hidden.bs.modal', function () {
  $('#like-movie').off('click');
  console.log('hidden');
});

$('#actor-modal').on('hidden.bs.modal', function () {
  $('#like-actor').off('click');
  console.log('hidden');
});

$('#director-modal').on('hidden.bs.modal', function () {
  $('#like-director').off('click');
  console.log('hidden');
});


function load_movie(ui){
  $('#like-movie').prop('disabled', false);
      //if(ui['item'][0]['data']['poster'] != '')
  $('#movie-title').html(ui['item']['name']['value']+'('+ui['item']['year']['value']+')')
  $('#movie-image').attr('src',ui['item']['poster']['value'])
      //else
      //  $('#movie-image').attr('src',"http://placehold.it/150")
  $('#storyline').html(ui['item']['storyline']['value'])
  $('#rating').html(ui['item']['rating']['value'])
  $('#vertexMovieId').html(ui['item']['_id'])

    $('#movie-modal').modal('show');

    $.ajax({
      type:'GET',
      url:' api/details/movie/'+ui['item']['_id'],
      contentType: 'application/json',
    }).done(function(msg){
      var i=0;
      genres="";
      actors="";
      director= "";
      for(i=0;i<msg.length;i++){
        type = getType(msg[i])
        if(type=='Genre')
          genres += msg[i].name+"| ";
        else if(type == 'Actor')
          actors += msg[i]['name']+", "
        else if(type == 'Director')
          director = msg[i]['name']
      }
      actors = actors.substring(0, actors.length - 2);
      genres = genres.substring(0, genres.length - 2);
      $('#actors').html(actors);
      $('#director').html(director);
      $('#movie-title').append("<span class='right'>"+genres+"</span>");
    });

      $.ajax({
        type:'GET',
        url:'api/isliked/'+ui['item']['_id'],
        contentType: 'application/json',
      }).done( function(msg){
          if(msg[0] > 0){
            $('#like-movie').prop('disabled', true);
          }
          else{
            $('#like-movie').on('click', function(e){
              $.ajax({
                type:'POST',
                url:'api/like/'+ui['item']['_id'],
                contentType: 'application/json',
            }).done( function(msg){
              $('#like-movie').prop('disabled', true);
              alert('liked');
            });
          });
        }
      });
}

$('#rec-genre').on('click', function(e){
  $('#navbar-links > li.active').removeClass('active');
  $('#rec-genre').addClass('active')
  load_genres();
});
$('#rec-movie').on('click', function(e){
    $('#navbar-links > li.active').removeClass('active');
  $('#rec-movie').addClass('active')

  load_movies();
});
$('#rec-actor').on('click', function(e){
    $('#navbar-links > li.active').removeClass('active');
  $('#rec-actor').addClass('active')

  load_actors();
});

$('#rec-home').on('click', function(e){
    $('#navbar-links > li.active').removeClass('active');
  $('#rec-home').addClass('active')

  load_global();
});

$('#rec-director').on('click', function(e){
    $('#navbar-links > li.active').removeClass('active');
  $('#rec-director').addClass('active')
  load_directors();
});

$('#logout').on('click', function(e){
    $.ajax({
        type:'POST',
        url:'api/logout',
        contentType: 'application/json',
      }).done(function(msg){
    window.location = 'login.html'
    });
});
