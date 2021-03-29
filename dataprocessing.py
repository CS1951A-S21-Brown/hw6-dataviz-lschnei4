import pandas as pd 
import numpy as np


#import csv files
netflix_csv = pd.read_csv('data/netflix.csv', usecols=['title','type', 'release_year','duration', 'listed_in','director','cast', 'country'])
netflix = pd.DataFrame(netflix_csv)

#Questions:
#   1. Your boss wants to know the number of titles per genre on Netflix.

#split by movies and TV shows
movies = netflix[netflix['type']=='Movie']
tv = netflix[netflix['type']=='TV Show']

#create new dataframe with just titles and genre for movie and TV
genres_movies = pd.DataFrame(movies['listed_in'].str.split(',').tolist(),index = movies['title']).stack()
genres_movies = genres_movies.reset_index([0,'title'])
genres_movies.columns = ['title','listed_in']
genres_movies['listed_in'] = genres_movies['listed_in'].str.strip()

genres_tv = pd.DataFrame(tv['listed_in'].str.split(',').tolist(),index = tv['title']).stack()
genres_tv = genres_tv.reset_index([0,'title'])
genres_tv.columns = ['title','listed_in']
genres_tv['listed_in'] = genres_tv['listed_in'].str.strip()

#get counts for movies
movies_genre_groups = genres_movies.groupby(genres_movies['listed_in'])
movies_cnt = movies_genre_groups['title'].count()

movies_cnt.to_csv('movies_by_genre.csv', header=True)

#get genres for TV Shows
tv_genre_groups = genres_tv.groupby(genres_tv['listed_in'])
tv_cnt = tv_genre_groups['title'].count()

tv_cnt.to_csv('tv_by_genre.csv', header=True)


#   2. Your boss wants to understand the average runtime of movies by release year.
movies['duration'] = movies['duration'].str.replace(' min', '').astype(int)

#group by release year to get average duration
release_year = movies[movies["release_year"]>=1980]
release_year = release_year.groupby(movies['release_year'])
release_year_duration = release_year['duration'].mean().round(1)


#get years 1980+
release_year_duration.to_csv('duration_by_year.csv',header=True)



#   3. Top director + actor pairs by number of movies made

#create new dataframe with actors separated for reccent (movies in past 5 years) movies and drop rows with missing entries
reccent = movies[movies['country']=='United States'].dropna(subset=['cast', 'director'])
reccent_movies = pd.DataFrame(reccent['cast'].str.split(',').tolist(),index = reccent['director']).stack()
reccent_movies = reccent_movies.reset_index([0,'director'])
reccent_movies.columns = ['cast','director']
reccent_movies['director_actor'] = reccent_movies['cast'].str.strip() + " & " + reccent_movies['director']
pairs_grouped = reccent_movies['director_actor'].groupby(reccent_movies['director_actor'])
pairs_count = pairs_grouped.count()
director_actor_pairs = pairs_count[(pairs_count > 2)]   #set a threshold to make processing data in javascript faster
director_actor_pairs.to_csv('director_actor_pairs.csv', header=['count'])








# #create new dataframe with actors separated for reccent (movies in past 3 years) movies in United States
# reccent_movies = movies[movies['release_year']>=2018]
# reccent_movies = reccent_movies[reccent_movies['country']=="United States"].dropna(subset=['cast'])

# source=[]
# target=[]

# for cast in reccent_movies['cast']:
#     cast_list = cast.split(',')
#     for i in range(len(cast_list)):
#     #set a source actor and create source/target pairs with remaining actors
#         for k in range(len(cast_list)):
#             if k != i:                          #as long and k!=i, create actor pairs
#                 source.append(cast_list[i])
#                 target.append(cast_list[k])
    
# pairs = {'source': source, 'target': target}

# actor_pairs = pd.DataFrame(pairs)

# actor_pairs.to_json('actor_pairs.json',orient='records')