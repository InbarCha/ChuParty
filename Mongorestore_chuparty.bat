set dumpDir=%1

REM api_coures
mongorestore --gzip --drop --db djongo_test --collection api_course --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin "%dumpDir%\api_course.bson.gz"

REM api_exam
mongorestore --gzip --drop --db djongo_test --collection api_exam --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin "%dumpDir%\api_exam.bson.gz"

REM api_admin
mongorestore --gzip --drop --db djongo_test --collection api_admin --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin "%dumpDir%\api_admin.bson.gz"

REM api_lecturer
mongorestore --gzip --drop --db djongo_test --collection api_lecturer --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin "%dumpDir%\api_lecturer.bson.gz"

REM api_question
mongorestore --gzip --drop --db djongo_test --collection api_question --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin "%dumpDir%\api_question.bson.gz"

REM api_school
REM mongorestore --gzip --drop --db djongo_test --collection api_school --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin "%dumpDir%\api_school.bson.gz"

REM api_student
mongorestore --gzip --drop --db djongo_test --collection api_student --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin "%dumpDir%\api_student.bson.gz"

REM api_subject
mongorestore --gzip --drop --db djongo_test --collection api_subject --host ChupartyCluster-shard-0/chupartycluster-shard-00-00-k7qfx.mongodb.net:27017,chupartycluster-shard-00-01-k7qfx.mongodb.net:27017,chupartycluster-shard-00-02-k7qfx.mongodb.net:27017 --ssl --username Chuparty_Admin --password PC57YKbzBIMY7kvk --authenticationDatabase admin "%dumpDir%\api_subject.bson.gz"