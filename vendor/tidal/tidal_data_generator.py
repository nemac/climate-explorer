import glob
import pandas as pd
import numpy as np
import click


def tidal_data_json(df):
    df.fillna(0, inplace=True)
    df.columns = df.iloc[2]
    # Clarification from Jeff about correlation between previous and current models. int_low and int correlate to
    # low and high from prior version.
    bins = ["floods_historical", "int_low", "int"]
    # bins = ["floods_historical", "low_scenario", "int_low", "int", "int_high", "high", "extreme"]
    master_list = []
    for category in bins:
        master_list.append(df[(df[0] == category)])
    with open("tidal_data.json", 'w') as tidal_data:
        for df, bin in zip(master_list, bins):
            df = df.set_index('ID')
            del df[0]
            tidal_data.write("{\n")
            tidal_data.write(f'\t"{bin}": {{\n')
            for columns in df:
                tidal_data.write(f'\t\t"{str(columns)[:-2]}": {{\n')
                for index, row in df.iterrows():
                    tidal_data.write(f'\t\t\t"{index}": {row[columns]},\n')
                tidal_data.write(f'}},\n')


def tidal_stations_json(df):
    df = df.set_index('Station Name')
    del df["Unnamed: 0"]
    with open("tidal_stations.json", 'w') as file:
        file.write("[\n")
        for column in df:
            file.write("  {\n")
            file.write(f'    "id": "{str(df[column].ID)[:-2]}",\n')
            file.write(f'    "station": "{column}",\n')
            file.write(f'    "lon": "{df[column].Long}",\n')
            file.write(f'    "lat": "{df[column].Lat}",\n')
            file.write(f'    "derived": "{df[column].Derived}"\n')
            file.write("  },\n")
        file.write("]")


def html_button_data(df):
    df.index = df.index.map(int)
    df = df.set_index('Station Name')
    del df["Unnamed: 0"]
    for column in df:
        print(f'<option value="{str(df[column].ID)[:-2]}">{column}</option>')


def TidalStationPrep(csv):
    df = pd.read_csv(csv)
    df2 = df.copy()
    tidal_data_json(df)
    tidal_stations_json(df2)
    html_button_data(df2)


if __name__ == '__main__':
    TidalStationPrep("techrpt86_PaP_of_HTFlooding.csv")
