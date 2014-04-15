
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


function load_genres(){
  $.ajax({
    type:'POST',
    url:' http://localhost:7474/db/data/cypher',
    contentType: 'application/json',
    data:JSON.stringify({
      "query" : "MATCH (p:Person {username: {username}})-[:LIKES]->(g:Genre), (m:Movie)-[:GENRE]-(g) where not (p)-[:LIKES]-(m) return distinct m order by m.rating DESC limit 200",
      "params" : {
       "username" : $('#username').val()
      }
    })
  }).done( function(msg){
    populate(msg.data)
  });
}

function load_actors(){
  $.ajax({
    type:'POST',
    url:' http://localhost:7474/db/data/cypher',
    contentType: 'application/json',
    data:JSON.stringify({
      "query" : "MATCH (p:Person {username: {username}})-[:LIKES]->(a:Actor), (m:Movie)-[:Acted]-(a) where not (p)-[:LIKES]-(m) return distinct m order by m.rating DESC limit 200",
      "params" : {
       "username" : $('#username').val()
      }
    })
  }).done( function(msg){
    populate(msg.data)
  });
}

function load_global(){

  function query1(){
    return (  
      $.ajax({
        type:'POST',
        url:' http://localhost:7474/db/data/cypher',
        contentType: 'application/json',
        data:JSON.stringify({
          "query" : "match (p:Person {username:{username}})-[:LIKES]-(a:Actor), (p)-[:LIKES]-(g:Genre), (m:Movie)-[:Acted]->(a), (m)-[:GENRE]-(g) where not (p)-[:LIKES]-(m) return m",
          "params" : {
           "username" : $('#username').val()
          }
        })
      })
    );
  }

  function query2(){
    return (  
      $.ajax({
        type:'POST',
        url:' http://localhost:7474/db/data/cypher',
        contentType: 'application/json',
        data:JSON.stringify({
          "query" : "match (p:Person {username:{username}})-[:LIKES]-(a:Actor), (p)-[:LIKES]-(d:Director), (m:Movie)-[:Acted]->(a), (m)-[:Directed]-(d) where not (p)-[:LIKES]-(m) return m",
          "params" : {
           "username" : $('#username').val()
          }
        })
      })
    );
  }


  function query3(){
    return (  
      $.ajax({
        type:'POST',
        url:' http://localhost:7474/db/data/cypher',
        contentType: 'application/json',
        data:JSON.stringify({
          "query" : "match (p:Person {username:{username}})-[:LIKES]-(d:Director), (p)-[:LIKES]-(g:Genre), (m)-[:Directed]-(d), (m)-[:GENRE]-(g) where not (p)-[:LIKES]-(m) return m",
          "params" : {
           "username" : $('#username').val()
          }
        })
      })
    );
  }

  $.when(query3(), query2(), query1()).done( function(msg3, msg2, msg1){
    console.log(msg3);
    console.log(msg2);
    console.log(msg1);
    movies = _.union(msg3[0].data, msg2[0].data, msg1[0].data);
    movies = _.sortBy(movies, function(item){
      return item[0].data.rating;
    });
    populate(movies.reverse());

  });
}

function load_directors(){
  $.ajax({
    type:'POST',
    url:' http://localhost:7474/db/data/cypher',
    contentType: 'application/json',
    data:JSON.stringify({
      "query" : "MATCH (p:Person {username: {username}})-[:LIKES]->(d:Director), (m:Movie)-[:Directed]-(d) where not (p)-[:LIKES]-(m) return distinct m order by m.rating DESC limit 200",
      "params" : {
       "username" : $('#username').val()
      }
    })
  }).done( function(msg){
    populate(msg.data)
  });
}



function populate(movies){
  if (movies.length == 0){
    $('#rec').html("Too few likes to give recommendation yet! Please like a few more Direcotrs, Movies, Acotrs and Genres");
  }
  else{
    $('.movie-rec').off('click');
    $('#rec').html('');
    movies = _.uniq(movies, function(item,key,a){
      return item[0].data.name;
    })
    var i = 0, j=0;
    for(i=0;i<movies.length;i+=3){
      html = "<br><br><div class='row'>"
      $('#rec').append(html);
      for(j=0;j<3;j++){
        if(i+j >= movies.length)
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
}




