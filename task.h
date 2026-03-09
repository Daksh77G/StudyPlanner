#ifndef TASK_H
#define TASK_H

#include <string>
#include <ctime>
using namespace std;

class Task {
private:
    string name;
    string subject;
    time_t deadline;
    int priority; // 1 = High, 2 = Medium, 3 = Low
    bool completed;

public:
    Task(string name, string subject, time_t deadline, int priority);

    string getName();
    string getSubject();
    time_t getDeadline();
    int getPriority();
    bool isCompleted();

    void markComplete();
};

#endif