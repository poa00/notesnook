import Notebooks from "./notebooks";
import Notes from "./notes";
import Topic from "../models/topic";

export default class Topics {
  /**
   *
   * @param {Notebooks} notebooks
   * @param {Notes} notes
   * @param {string} notebookId
   */
  constructor(notebooks, notes, notebookId) {
    this.notebooks = notebooks;
    this.notebookId = notebookId;
    this.notes = notes;
  }

  exists(topic) {
    return this.all.findIndex(v => v.title === (topic.title || topic)) > -1;
  }

  async add(topic) {
    await this.notebooks.add({
      id: this.notebookId,
      topics: [topic]
    });
    return this.topic(topic);
  }

  get all() {
    return this.notebooks.notebook(this.notebookId).data.topics;
  }

  topic(topic) {
    if (typeof topic === "string") {
      topic = this.all.find(t => t.title === topic);
    }
    if (!topic) return;
    return new Topic(this, topic);
  }

  async delete(...topics) {
    let allTopics = JSON.parse(JSON.stringify(this.all)); //FIXME: make a deep copy
    for (let i = 0; i < allTopics.length; i++) {
      let topic = allTopics[i];
      if (!topic) continue;
      let index = topics.findIndex(t => (t.title || t) === topic.title);
      let t = this.topic(topic);
      await t.transaction(() => t.delete(...topic.notes), false);
      if (index > -1) {
        allTopics.splice(i, 1);
      }
    }
    await this.notebooks.add({
      id: this.notebookId,
      topics: allTopics
    });
  }
}
