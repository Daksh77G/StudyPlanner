#include "FileManager.h"
#include <fstream>
#include <sstream>

using namespace std;

void FileManager::saveTasks(const vector<Task>& tasks) {

    ofstream file("tasks.txt");

    for (const Task& t : tasks) {

        file << t.getName() << "|"
             << t.getSubject() << "|"
             << t.getDeadline() << "|"
             << t.getPriority() << "|"
             << t.isCompleted()
             << endl;
    }

    file.close();
}

vector<Task> FileManager::loadTasks() {

    vector<Task> tasks;

    ifstream file("tasks.txt");

    string line;

    while (getline(file, line)) {

        stringstream ss(line);

        string name, subject, deadlineStr, priorityStr, completedStr;

        getline(ss, name, '|');
        getline(ss, subject, '|');
        getline(ss, deadlineStr, '|');
        getline(ss, priorityStr, '|');
        getline(ss, completedStr, '|');

        time_t deadline = stol(deadlineStr);
        int priority = stoi(priorityStr);
        bool completed = stoi(completedStr);

        Task task(name, subject, deadline, priority);

        if (completed)
            task.markComplete();

        tasks.push_back(task);
    }

    file.close();

    return tasks;
}