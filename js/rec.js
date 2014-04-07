
function request1(){
  return (
    $.ajax({
      type:'POST',
      url:' http://localhost:7474/db/data/cypher',
      contentType: 'application/json',
      data:JSON.stringify({
        "query" : "MATCH (p:Person {username: {username}})-[:LIKES]->(m:Movie), (m)-[:Acted]-(a:Actor), (m)-[:Directed]-(d:Director), (m)-[:GENRE]-(g:Genre), (n:Movie)-[:Acted]-(a), (n:Movie)-[:Directed]-(d), (n)-[:GENRE]-(g) where not (p)-[:LIKES]-(n) return distinct n order by n.rating DESC limit 50",
        "params" : {
         "username" : $('#username').val()
        }
      })
    })
  );
}

function request2(){
  return (
    $.ajax({
      type:'POST',
      url:' http://localhost:7474/db/data/cypher',
      contentType: 'application/json',
      data:JSON.stringify({
        "query" : "MATCH (p:Person {username: {username}})-[:LIKES]->(m:Movie), (m)-[:Directed]-(d:Director), (m)-[:GENRE]-(g:Genre), (n:Movie)-[:Directed]-(d), (n)-[:GENRE]-(g) where not (p)-[:LIKES]-(n) return distinct n order by n.rating DESC limit 50",
        "params" : {
         "username" : $('#username').val()
        }
      })
    })
  );
}


function request3(){
  return (
    $.ajax({
      type:'POST',
      url:' http://localhost:7474/db/data/cypher',
      contentType: 'application/json',
      data:JSON.stringify({
        "query" : "MATCH (p:Person {username: {username}})-[:LIKES]->(m:Movie), (m)-[:Acted]-(a:Actor), (m)-[:Directed]-(d:Director), (n:Movie)-[:Acted]-(a), (n:Movie)-[:Directed]-(d) where not (p)-[:LIKES]-(n) return distinct n order by n.rating DESC limit 50",
        "params" : {
         "username" : $('#username').val()
        }
      })
    })
  );
}

function request4(){
  return (
    $.ajax({
      type:'POST',
      url:' http://localhost:7474/db/data/cypher',
      contentType: 'application/json',
      data:JSON.stringify({
        "query" : "MATCH (p:Person {username: {username}})-[:LIKES]->(m:Movie), (m)-[:Acted]-(a:Actor), (m)-[:GENRE]-(g:Genre), (n:Movie)-[:Acted]-(a), (n)-[:GENRE]-(g) where not (p)-[:LIKES]-(n) return distinct n order by n.rating DESC limit 50",
        "params" : {
         "username" : $('#username').val()
        }
      })
    })
  );
}

function load_movies(){
  movies = []
  $.when(request2(), request3()).done( function(msg2, msg3){
    console.log(msg2);
    console.log(msg3);
    //console.log(msg4);

    movies = _.union(msg2[0].data, msg3[0].data);
    movies = _.sortBy(movies, function(item){
      return item[0].data.rating;
    });
    populate(movies.reverse());
  });
  $.when(request4()).done( function(msg4){
    console.log(msg4)
    movies = _.union(movies, msg4.data);
    movies = _.sortBy(movies, function(item){
      return item[0].data.rating;
    });
    populate(movies.reverse());
  });

}


function populate(movies){
  $('.movie-rec').off('click');
  $('#rec').html('');
  movies = _.uniq(movies, function(item,key,a){
    return item[0].data.name;
  })
  var i = 0, j=0;
  for(i=0;i<movies.length;i+=3){
    html = "<br><div class='row'>"
    $('#rec').append(html);
    for(j=0;j<3;j++){
      if(i+j > movies.length)
        break;
      name = movies[i+j][0].data.name;
      poster = movies[i+j][0].data.poster;
      year = '('+movies[i+j][0].data.year+')';
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




