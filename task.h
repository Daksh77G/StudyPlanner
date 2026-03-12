#ifndef TASK_H
#define TASK_H

#include <string>
#include <ctime>

class Task {
private:
    std::string name;
    std::string subject;
    std::time_t deadline;
    int priority; // 1 = High, 2 = Medium, 3 = Low
    bool completed;

public:
    Task(std::string name, std::string subject, std::time_t deadline, int priority);

    std::string getName() const;
    std::string getSubject() const;
    std::time_t getDeadline() const;
    int getPriority() const;
    bool isCompleted() const;

    void markComplete();
};

#endif