set dumpDir=%1

REM api_coures
mongodump --gzip --db djongo_test --collection api_course --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin -o "%dumpDir%"

REM api_exam
mongodump --gzip --db djongo_test --collection api_exam --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin -o "%dumpDir%"

REM api_admin
REM mongodump --gzip --db djongo_test --collection api_admin --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin -o "%dumpDir%"

REM api_lecturer
REM mongodump --gzip --db djongo_test --collection api_lecturer --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin -o "%dumpDir%"

REM api_question
mongodump --gzip --db djongo_test --collection api_question --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin -o "%dumpDir%"

REM api_school
mongodump --gzip --db djongo_test --collection api_school --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin -o "%dumpDir%"

REM api_student
REM mongodump --gzip --db djongo_test --collection api_student --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin -o "%dumpDir%"

REM api_subject
mongodump --gzip --db djongo_test --collection api_subject --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin -o "%dumpDir%"