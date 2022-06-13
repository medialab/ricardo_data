# GowaJRHicks recovery
git log --pretty=format:'%H' 5888a42^..HEAD -- ./data/flows/GowaJRHicks20132017.csv > hicks_commits_to_merge.csv
minet fetch --url-template 'https://raw.githubusercontent.com/medialab/ricardo_data/{value}/data/flows/GowaJRHicks20132017.csv' --filename-template '{line["hash"]}.csv' hash ./hicks_commits_to_merge.csv
xsv cat rows GowaJRHicks20132017/* > ./GowaJRHicks20132017.csv



# detect other cases 
git log --grep="Flows_.*" --pretty=oneline --stat 5888a42^..HEAD --diff-filter=M -- ./data/flows/

# f086b0bca4cdaaa904e3e5e7c77fa0913a0e247a Flows_Panama_1914-1938
#  data/flows/GowaJRHicks20132017.csv                                                 |  4383 ++------------------------
#  data/flows/StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918.csv | 24381 +------------------------------------------------------------------------------------------------------------------------------------------------
#  2 files changed, 360 insertions(+), 28404 deletions(-)

# a2421aad9327167a211df6c5a6e3285bc78b8f53 Flows_Naples_1859-1860
#  data/flows/MovimentoCommercialeDelProvincieDellItaliaSettentrionale_1859.csv | 157 ++++++++++++++++++++++++++++++++++++++++-----------------------------------------------------------------------------------------------------------------
#  1 file changed, 41 insertions(+), 116 deletions(-)

# 8cdfc9493526f53e9e6b25cdbcd1c31fccf4738a Flows_Italy_1861-77_1920
#  data/flows/MovimentoCommercialeDelRegnoDitalia_1884.csv | 268 ++++++++++--------------------------------------------------------------------------------------------------------------------------------------------------------------------
#  1 file changed, 14 insertions(+), 254 deletions(-)


# process each individually
git log a2421aad9327167a211df6c5a6e3285bc78b8f53^1 data/flows/MovimentoCommercialeDelProvincieDellItaliaSettentrionale_1859.csv
#a702d07dff2b7ad9dd426b4968e5ec5612057935
curl https://raw.githubusercontent.com/medialab/ricardo_data/a702d07dff2b7ad9dd426b4968e5ec5612057935/data/flows/MovimentoCommercialeDelProvincieDellItaliaSettentrionale_1859.csv -o update_data_scripts/GowJRHicks20132017_recover_smashed_data/MovimentoCommercialeDelProvincieDellItaliaSettentrionale_1859/a702d07dff2b7ad9dd426b4968e5ec5612057935.csv
curl https://raw.githubusercontent.com/medialab/ricardo_data/a2421aad9327167a211df6c5a6e3285bc78b8f53/data/flows/MovimentoCommercialeDelProvincieDellItaliaSettentrionale_1859.csv -o update_data_scripts/GowJRHicks20132017_recover_smashed_data/MovimentoCommercialeDelProvincieDellItaliaSettentrionale_1859/a2421aad9327167a211df6c5a6e3285bc78b8f53.csv
xsv cat rows update_data_scripts/GowJRHicks20132017_recover_smashed_data/MovimentoCommercialeDelProvincieDellItaliaSettentrionale_1859/* > update_data_scripts/GowJRHicks20132017_recover_smashed_data/MovimentoCommercialeDelProvincieDellItaliaSettentrionale_1859.csv

git log f086b0bca4cdaaa904e3e5e7c77fa0913a0e247a^1 data/flows/StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918.csv
#8d0b519767263f6e1a4c7798025d8e10a8bcd760
mkdir update_data_scripts/GowJRHicks20132017_recover_smashed_data/StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918
curl https://raw.githubusercontent.com/medialab/ricardo_data/f086b0bca4cdaaa904e3e5e7c77fa0913a0e247a/data/flows/StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918.csv -o update_data_scripts/GowJRHicks20132017_recover_smashed_data/StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918/f086b0bca4cdaaa904e3e5e7c77fa0913a0e247a.csv
curl https://raw.githubusercontent.com/medialab/ricardo_data/8d0b519767263f6e1a4c7798025d8e10a8bcd760/data/flows/StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918.csv -o update_data_scripts/GowJRHicks20132017_recover_smashed_data/StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918/8d0b519767263f6e1a4c7798025d8e10a8bcd760.csv
xsv cat rows update_data_scripts/GowJRHicks20132017_recover_smashed_data/StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918/* > update_data_scripts/GowJRHicks20132017_recover_smashed_data/StatisticalAbstractForThePrincipalAndOtherForeignCountries_19071918.csv

git log 8cdfc9493526f53e9e6b25cdbcd1c31fccf4738a^1 data/flows/MovimentoCommercialeDelRegnoDitalia_1884.csv
#8d0b519767263f6e1a4c7798025d8e10a8bcd760
mkdir update_data_scripts/GowJRHicks20132017_recover_smashed_data/MovimentoCommercialeDelRegnoDitalia_1884
curl https://raw.githubusercontent.com/medialab/ricardo_data/8cdfc9493526f53e9e6b25cdbcd1c31fccf4738a/data/flows/MovimentoCommercialeDelRegnoDitalia_1884.csv -o update_data_scripts/GowJRHicks20132017_recover_smashed_data/MovimentoCommercialeDelRegnoDitalia_1884/8cdfc9493526f53e9e6b25cdbcd1c31fccf4738a.csv
curl https://raw.githubusercontent.com/medialab/ricardo_data/8d0b519767263f6e1a4c7798025d8e10a8bcd760/data/flows/MovimentoCommercialeDelRegnoDitalia_1884.csv -o update_data_scripts/GowJRHicks20132017_recover_smashed_data/MovimentoCommercialeDelRegnoDitalia_1884/8d0b519767263f6e1a4c7798025d8e10a8bcd760.csv
xsv cat rows update_data_scripts/GowJRHicks20132017_recover_smashed_data/MovimentoCommercialeDelRegnoDitalia_1884/* > update_data_scripts/GowJRHicks20132017_recover_smashed_data/MovimentoCommercialeDelRegnoDitalia_1884.csv