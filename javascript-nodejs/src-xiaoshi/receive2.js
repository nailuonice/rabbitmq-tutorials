const amqp = require('amqplib');

async function consumer() {
    // 1. 创建链接对象
    const connection = await amqp.connect('amqp://localhost:5672');

    // 2. 获取通道
    const channel = await connection.createChannel();

    // 3. 声明参数
    /*
        Routing key中可以包含两种通配符，类似于正则表达式：
        “#”通配任何零个或多个word
        “*”通配任何单个word 
    */
    const exchangeName = 'qosEx';
    const queueName = 'qosQueue2';
    const routingKey = '*.test001.*';

    // 4. 声明交换机、对列进行绑定
    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    await channel.assertQueue(queueName);
    await channel.bindQueue(queueName, exchangeName, routingKey);
    
    // 5. 限流参数设置
    await channel.prefetch(1, false);

    // 6. 限流，noAck参数必须设置为false
    await channel.consume(queueName, msg => {
        console.log('Consumer：', msg.content.toString());

        channel.ack(msg);
    }, { noAck: false });
}

consumer();