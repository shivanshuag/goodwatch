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



def get(list):
    global n
    hxs = lxml.html.document_fromstring(requests.get(list,proxies=proxyDict).content)
    try:
        next_link = hxs.xpath('//*[@class="title"]/span[1]/@data-tconst')
        for link in next_link:
            print link
            n=n+1
            f.write('http://www.imdb.com/title/'+link.strip()+'\n')
        if n<85000:
            print n
            get('http://www.imdb.com/search/title?at=0&release_date=2000,2014&sort=moviemeter,asc&start='+str(n+1)+'&title_type=feature')
    except IndexError:
        print 'error'
        get(list)

f = open('links1', 'a')
n=48100
get('http://www.imdb.com/search/title?at=0&release_date=2000,2014&sort=moviemeter,asc&start=48101&title_type=feature')