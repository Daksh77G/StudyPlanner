#include "task.h"

Task::Task(std::string n, std::string s, std::time_t d, int p) {
    name = n;
    subject = s;
    deadline = d;
    priority = p;
    completed = false;
}

std::string Task::getName() const {
    return name;
}

std::string Task::getSubject() const {
    return subject;
}

std::time_t Task::getDeadline() const {
    return deadline;
}

int Task::getPriority() const {
    return priority;
}

bool Task::isCompleted() const {
    return completed;
}

void Task::markComplete() {
    completed = true;
}