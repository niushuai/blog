#!/bin/bash

for i in `seq 1 22`
do
	touch thinking_in_java_chapter${i}
	echo "---\nlayout: post\ntitle: 第${i}章\ntags: JAVA编程思想\ncategories: JAVA\n---" > thinking_in_java_chapter${i}
done
