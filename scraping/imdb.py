#!/usr/bin/env python
import sys
import os
import requests
import lxml.html
import json

http_proxy  = "http://gowthamg:Masonops@ironport2.iitk.ac.in:3128"
https_proxy = "http://gowthamg:Masonops@ironport2.iitk.ac.in:3128"
ftp_proxy   = "http://gowthamg:Masonops@ironport2.iitk.ac.in:3128"

proxyDict = { 
              "http"  : http_proxy, 
              "https" : https_proxy, 
              "ftp"   : ftp_proxy
            }


def get(link):
    hxs = lxml.html.document_fromstring(requests.get(link,proxies=proxyDict).content)
    movie = {}
    try:
        movie['title'] = hxs.xpath('//*[@id="overview-top"]/h1/span[1]/text()')[0].strip()
    except IndexError:
        movie['title']
    try:
        movie['year'] = hxs.xpath('//*[@id="overview-top"]/h1/span[2]/a/text()')[0].strip()
    except IndexError:
        try:
            movie['year'] = hxs.xpath('//*[@id="overview-top"]/h1/span[3]/a/text()')[0].strip()
        except IndexError:
            movie['year'] = ""
    # try:
    #     movie['certification'] = hxs.xpath('//*[@id="overview-top"]/div[2]/span[1]/@title')[0].strip()
    # except IndexError:
    #     movie['certification'] = ""
    # try:
    #     movie['running_time'] = hxs.xpath('//*[@id="overview-top"]/div[2]/time/text()')[0].strip()
    # except IndexError:
    #     movie['running_time'] = ""
    try:
        movie['genre'] = hxs.xpath('//*[@id="overview-top"]/div[2]/a/span/text()')
    except IndexError:
        movie['genre'] = []
    # try:
    #     movie['release_date'] = hxs.xpath('//*[@id="overview-top"]/div[2]/span[3]/a/text()')[0].strip()
    # except IndexError:
    #     try:
    #         movie['release_date'] = hxs.xpath('//*[@id="overview-top"]/div[2]/span[4]/a/text()')[0].strip()
    #     except Exception:
    #         movie['release_date'] = ""
    try:
        movie['rating'] = hxs.xpath('//*[@id="overview-top"]/div[3]/div[3]/strong/span/text()')[0]
    except IndexError:
        movie['rating'] = ""
    # try:
    #     movie['metascore'] = hxs.xpath('//*[@id="overview-top"]/div[3]/div[3]/a[2]/text()')[0].strip().split('/')[0]
    # except IndexError:
    #     movie['metascore'] = 0
    # try:
    #     movie['description'] = hxs.xpath('//*[@id="overview-top"]/p[2]/text()')[0].strip()
    # except IndexError:
    #     movie['description'] = ""
    try:
        movie['director'] = hxs.xpath('//*[@id="overview-top"]/div[4]/a/span/text()')[0].strip()
    except IndexError:
        movie['director'] = ""
    try:
        movie['stars'] = hxs.xpath('//*[@id="overview-top"]/div[6]/a/span/text()')
    except IndexError:
        movie['stars'] = ""
    try:
        movie['poster'] = hxs.xpath('//*[@id="img_primary"]/div/a/img/@src')[0]
    except IndexError:
        movie['poster'] = ""
    # try:
    #     movie['gallery'] = hxs.xpath('//*[@id="combined-photos"]/div/a/img/@src')
    # except IndexError:
    #     movie['gallery'] = ""
    try:
        movie['storyline'] = hxs.xpath('//*[@id="titleStoryLine"]/div[1]/p/text()')[0].strip()
    except IndexError:
        movie['storyline'] = ""
    # try:
    #     movie['votes'] = hxs.xpath('//*[@id="overview-top"]/div[3]/div[3]/a[1]/span/text()')[0].strip()
    # except IndexError:
    #     movie['votes'] = ""
    return movie
n=0
lineno = 0
f_link = open('links','r')
f = open('cipher01', 'a')
for line in f_link:
    movie = get(line)
    #print movie
    movie_node = "CREATE ("+'a'+str(n)+":Movie {name: \""+movie['title']+"\", year:  "+movie['year']+", poster:\""+movie['poster']+"\", storyline:\""+movie['storyline']+"\", rating:\""+movie['rating']+"\" })\n"
    movie_num = n
    n=n+1
    genre_node = ''
    genre_rel = ''
    for genre in movie['genre']:
        genre_node += "MERGE ("+'a'+str(n)+":Genre {name: \""+genre+"\"})\n"
        genre_rel += "CREATE ("+'a'+str(movie_num)+")-[:GENRE]->("+'a'+str(n)+")\n"
        n=n+1
    actor_node = ''
    actor_rel = ''
    for actor in movie['stars']:
        actor_node += "MERGE ("+'a'+str(n)+":Actor {name: \""+actor+"\"})\n"
        actor_rel += "CREATE ("+'a'+str(movie_num)+")-[:Acted]->("+'a'+str(n)+")\n"
        n=n+1

    director_node = "MERGE ("+'a'+str(n)+":Director {name: \""+movie['director']+"\"})\n"
    director_rel = "CREATE ("+'a'+str(movie_num)+")-[:Directed]->("+'a'+str(n)+")\n"
    n=n+1
    query = movie_node+genre_node+genre_rel+actor_node+actor_rel+director_node+director_rel
    f.write('\nbegin\n'+query.encode('utf8')+';\ncommit')
    lineno = lineno+1
    print ("done till link "+str(lineno))
f_link.close()
f.close()