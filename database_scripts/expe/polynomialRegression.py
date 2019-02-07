print(__doc__)

# Author: Mathieu Blondel
#         Jake Vanderplas
# License: BSD 3 clause

import numpy as np
import matplotlib.pyplot as plt

from sklearn.linear_model import Ridge, LinearRegression, TheilSenRegressor, RANSACRegressor, HuberRegressor
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from csvkit import DictReader
from sklearn.metrics import explained_variance_score,mean_squared_error, r2_score

# def f(x):
#     """ function to approximate by polynomial interpolation"""
#     return x * np.sin(x)

with open('RICardo-France-1787-1938.csv', 'r') as ft:
    r = DictReader(ft)
    france_uk = []
    france_uk_bm = []
    france_germany = []
    france_zollverein = []
    for line in r:
        if line['reporting'] == 'France':
            if line['partner'] == 'UnitedKingdom':
                france_uk.append(line)
            if line['partner'] == 'UnitedKingdom_BritishMediterranean':
                france_uk_bm.append(line)
            if line['partner'] == 'Germany':
                france_germany.append(line)
            if line['partner'] ==  'GermanyZollverein':
                france_zollverein.append(line)
    # settings
    hole_max_size = 15 #years
    data = france_uk
    INTERVAL = 5

    # detect missing years and fill training data x and y
    missing_years = []
    x_truth = []
    y_truth = [] 
    for l in data:
        if l['export']:
            x_truth.append(l['year'])
            y_truth.append(l['export'].replace(',','.'))
        else:
            missing_years.append(l['year'])
    x_truth = np.int_(x_truth)
    y_truth = np.fromstring(','.join(y_truth), sep=',') 
    # detecting and filtering missing periods
    # make sure it's sorted
    missing_years.sort()
    missing_periods = []
    for i,y in enumerate(missing_years):
        # we merge interval if number of years between two periods <= INTERVAL
        if len(missing_periods)>0 and missing_periods[-1]['end'] >= int(y)-INTERVAL :
            # update last period
            missing_periods[-1]['end'] = int(y)
        else:
            missing_periods.append({'start':int(y), 'end':int(y)})
    print missing_periods 

    lw = 2
    plt.plot(x_truth, y_truth, color='cornflowerblue', linewidth=lw,
            label="france exports to UK")
    plt.scatter(x_truth, y_truth, color='navy', s=30, marker='o', label="training points")

    # complement
    x_bis = np.int_([l['year'] for l in france_uk_bm if l['export']])
    y_bis = np.fromstring(','.join(l['export'].replace(',','.') for l in france_uk_bm if l['export']),sep=',')
    plt.plot(x_bis, y_bis, color='purple', linewidth=lw,
            label="france exports to uk + bm")
    plt.scatter(x_bis, y_bis, color='purple', s=10, marker='o', label="training points")


    colors = ['gold', 'pink']

    for i,missing_period in enumerate(missing_periods):
        if len(missing_period) > hole_max_size:
            print "%s too big"%missing_period
            continue
        print missing_period, i, i%2, colors[i%2]
        model_years = range(missing_period['start']-INTERVAL, missing_period['end']+INTERVAL+1)
        x = np.int_([l['year'] for l in data if l['export'] and int(l['year']) in model_years])
        y = np.fromstring(','.join([l['export'].replace(',','.') for l in data if l['export'] and int(l['year']) in model_years]),sep=',')

        # # generate points used to plot
        x_plot = np.int_(range(min(x), max(x) + 1))

        # # generate points and keep a subset of them
        # x = np.linspace(0, 10, 100)
        # rng = np.random.RandomState(0)
        # rng.shuffle(x)
        # x = np.sort(x[:20])
        # y = f(x)

        # create matrix versions of these arrays
        X = x[:, np.newaxis]
        X_plot = x_plot[:, np.newaxis]
        

        
        
        model = make_pipeline(PolynomialFeatures(7), Ridge())
        #ridge max d=7 r2=0.9535087928347966
        #linearRegression d=7 r2=0.9491
        # TheilSenRegressor(random_state=42) d=20 r2=0.9513806826498599
        # RANSACRegressor(random_state=42) d=20 r2 score 0.9514053473468732
        #HuberRegressor()

        model.fit(X, y)
        y_plot = model.predict(X_plot)
        
        y_pred = [yp for j,yp in enumerate(y_plot) if x_plot[j] in x]
        x_pred = set(x_plot) - set(x)
        print "explaind variance score %s"%explained_variance_score(y, y_pred)  
        print "mean squaerd error %s"%mean_squared_error(y, y_pred)
        print 'r2 score %s'%r2_score(y, y_pred)
        plt.plot(x_plot, y_plot, color=colors[i%2], linewidth=lw,
                label="%s - %s (%s)"%(missing_period['start'],missing_period['end'],r2_score(y, y_pred)))
        y_imputed = [yp for j,yp in enumerate(y_plot) if x_plot[j] not in x_truth]
        # don't use sets here to keep the order
        x_imputed = [x for x in x_plot if x not in x_truth]
        plt.scatter(x_imputed, y_imputed, color='grey', s=20, marker='o', label="imputed points")


    plt.legend(loc='upper left')

    plt.show()