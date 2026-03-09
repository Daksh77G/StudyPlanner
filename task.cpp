#include "Task.h"


Task::Task(string n, string s, time_t d, int p) {
    name = n;
    subject = s;
    deadline = d;
    priority = p;
    completed = false;
}

string Task::getName() { 
    return name; 
}

string Task::getSubject() { 
    return subject; 
}

time_t Task::getDeadline() { 
    return deadline; 
}

int Task::getPriority() { 
    return priority; 
}

bool Task::isCompleted() { 
    return completed; 
}

void Task::markComplete() { 
    completed = true; 
}